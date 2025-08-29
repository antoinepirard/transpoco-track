import type { WebSocketMessage, VehicleUpdate } from '@/types/fleet';

interface WorkerMessage {
  type: 'connect' | 'disconnect' | 'send' | 'process';
  data?: unknown;
}

interface WorkerResponse {
  type: 'connected' | 'disconnected' | 'message' | 'error' | 'processed';
  data?: unknown;
}

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 1000;

// Frame batching for performance
const pendingUpdates = new Map<string, VehicleUpdate>();
let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_INTERVAL_MS = 16; // ~60fps

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  switch (type) {
    case 'connect':
      connect(data as string);
      break;
    case 'disconnect':
      disconnect();
      break;
    case 'send':
      send(data);
      break;
    case 'process':
      processData(data);
      break;
  }
};

function connect(url: string) {
  if (ws?.readyState === WebSocket.OPEN) {
    return;
  }

  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnectAttempts = 0;
    postMessage({
      type: 'connected',
      data: { timestamp: Date.now() },
    } satisfies WorkerResponse);
  };

  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle batching for vehicle updates
      if (message.type === 'vehicle_update') {
        const update = message.data as VehicleUpdate;
        batchVehicleUpdate(update);
      } else if (message.type === 'bulk_update') {
        const updates = message.data as VehicleUpdate[];
        updates.forEach((update) => batchVehicleUpdate(update));
      } else {
        // Non-vehicle updates pass through immediately
        postMessage({
          type: 'message',
          data: message,
        } satisfies WorkerResponse);
      }
    } catch (error) {
      postMessage({
        type: 'error',
        data: { message: 'Failed to parse WebSocket message', error },
      } satisfies WorkerResponse);
    }
  };

  ws.onclose = () => {
    postMessage({
      type: 'disconnected',
      data: { timestamp: Date.now() },
    } satisfies WorkerResponse);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      scheduleReconnect(url);
    }
  };

  ws.onerror = (error) => {
    postMessage({
      type: 'error',
      data: { message: 'WebSocket error', error },
    } satisfies WorkerResponse);
  };
}

function disconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }
}

function send(data: unknown) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    postMessage({
      type: 'error',
      data: { message: 'WebSocket not connected' },
    } satisfies WorkerResponse);
  }
}

function processData(rawData: unknown) {
  try {
    if (Array.isArray(rawData)) {
      const processedUpdates = rawData
        .map(processVehicleUpdate)
        .filter(Boolean);
      postMessage({
        type: 'processed',
        data: processedUpdates,
      } satisfies WorkerResponse);
    } else {
      const processed = processVehicleUpdate(rawData);
      if (processed) {
        postMessage({
          type: 'processed',
          data: processed,
        } satisfies WorkerResponse);
      }
    }
  } catch (error) {
    postMessage({
      type: 'error',
      data: { message: 'Failed to process data', error },
    } satisfies WorkerResponse);
  }
}

function processVehicleUpdate(data: unknown): VehicleUpdate | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const update = data as Record<string, unknown>;

  return {
    type: (update.type as VehicleUpdate['type']) || 'position',
    vehicleId: String(update.vehicleId || ''),
    timestamp:
      typeof update.timestamp === 'number'
        ? update.timestamp
        : new Date(update.timestamp as string).getTime(),
    data: update.data as VehicleUpdate['data'],
  };
}

function scheduleReconnect(url: string) {
  reconnectTimeout = setTimeout(
    () => {
      reconnectAttempts++;
      connect(url);
    },
    RECONNECT_DELAY * Math.pow(2, reconnectAttempts)
  );
}

function batchVehicleUpdate(update: VehicleUpdate) {
  // Store only the latest update per vehicle (deduping)
  pendingUpdates.set(update.vehicleId, update);

  // Schedule batch processing if not already scheduled
  if (!batchTimeout) {
    batchTimeout = setTimeout(flushBatch, BATCH_INTERVAL_MS);
  }
}

function flushBatch() {
  if (pendingUpdates.size === 0) {
    batchTimeout = null;
    return;
  }

  const updates = Array.from(pendingUpdates.values());
  pendingUpdates.clear();
  batchTimeout = null;

  // Send as a batched message
  postMessage({
    type: 'message',
    data: {
      type: 'bulk_update',
      organizationId: 'batched',
      data: updates,
    } as WebSocketMessage,
  } satisfies WorkerResponse);
}

export {};
