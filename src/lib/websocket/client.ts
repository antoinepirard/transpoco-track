import type { WebSocketMessage } from '@/types/fleet';

export interface WebSocketClientOptions {
  url: string;
  apiKey?: string;
  organizationId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  useWorker?: boolean;
}

export class WebSocketClient {
  private worker: Worker | null = null;
  private options: WebSocketClientOptions;
  private isConnected = false;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.options.useWorker && typeof Worker !== 'undefined') {
        this.connectWithWorker(resolve, reject);
      } else {
        this.connectDirect(resolve, reject);
      }
    });
  }

  private connectWithWorker(resolve: () => void, reject: (error: Error) => void) {
    try {
      this.worker = new Worker(
        new URL('../workers/websocket-worker.ts', import.meta.url)
      );

      this.worker.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'connected':
            this.isConnected = true;
            this.options.onConnect?.();
            resolve();
            break;
          case 'disconnected':
            this.isConnected = false;
            this.options.onDisconnect?.();
            break;
          case 'message':
            this.options.onMessage?.(data as WebSocketMessage);
            break;
          case 'error':
            this.options.onError?.(new Error(data.message));
            if (!this.isConnected) {
              reject(new Error(data.message));
            }
            break;
        }
      };

      this.worker.onerror = () => {
        this.options.onError?.(new Error('Worker error'));
        reject(new Error('Worker error'));
      };

      const wsUrl = this.buildWebSocketUrl();
      this.worker.postMessage({ type: 'connect', data: wsUrl });
    } catch (error) {
      reject(error as Error);
    }
  }

  private connectDirect(resolve: () => void, reject: (error: Error) => void) {
    reject(new Error('Direct WebSocket connection not implemented'));
  }

  private buildWebSocketUrl(): string {
    const url = new URL(this.options.url);
    if (this.options.apiKey) {
      url.searchParams.set('key', this.options.apiKey);
    }
    url.searchParams.set('org', this.options.organizationId);
    return url.toString();
  }

  disconnect(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'disconnect' });
      this.worker.terminate();
      this.worker = null;
    }
    this.isConnected = false;
  }

  send(data: unknown): void {
    if (this.worker && this.isConnected) {
      this.worker.postMessage({ type: 'send', data });
    }
  }

  subscribeToVehicleUpdates(vehicleIds: string[]): void {
    this.send({
      type: 'subscribe',
      channels: vehicleIds.map((id) => `vehicle:${id}`),
    });
  }

  subscribeToOrganization(): void {
    this.send({
      type: 'subscribe',
      channels: [`org:${this.options.organizationId}`],
    });
  }

  get connected(): boolean {
    return this.isConnected;
  }
}