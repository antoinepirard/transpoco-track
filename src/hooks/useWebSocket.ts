'use client';

import { useEffect, useRef, useState } from 'react';
import {
  WebSocketClient,
  type WebSocketClientOptions,
} from '@/lib/websocket/client';
import { useFleetStore } from '@/stores/fleet';
import type { WebSocketMessage, VehicleUpdate } from '@/types/fleet';

interface UseWebSocketOptions
  extends Omit<
    WebSocketClientOptions,
    'onMessage' | 'onConnect' | 'onDisconnect' | 'onError'
  > {
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket({
  autoConnect = true,
  onMessage,
  onError,
  ...options
}: UseWebSocketOptions) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    setConnectionStatus,
    updateVehicle,
    applyVehicleUpdates,
    updateVehicleWithRoadSnapping,
  } = useFleetStore();

  useEffect(() => {
    if (!autoConnect) return;

    const handleMessage = (message: WebSocketMessage) => {
      switch (message.type) {
        case 'vehicle_update':
          const update = message.data as VehicleUpdate;
          const pos = update.data?.currentPosition;
          if (
            pos &&
            typeof pos.latitude === 'number' &&
            typeof pos.longitude === 'number'
          ) {
            // Use road snapping for position updates
            updateVehicleWithRoadSnapping(
              update.vehicleId,
              pos.latitude,
              pos.longitude,
              pos.heading
            );
          } else {
            // Fall back to normal update for non-position data
            updateVehicle(update.vehicleId, update.data);
          }
          break;
        case 'bulk_update':
          const updates = message.data as VehicleUpdate[];
          // Process each update individually for road snapping
          for (const u of updates) {
            const p = u.data?.currentPosition;
            if (
              p &&
              typeof p.latitude === 'number' &&
              typeof p.longitude === 'number'
            ) {
              updateVehicleWithRoadSnapping(
                u.vehicleId,
                p.latitude,
                p.longitude,
                p.heading
              );
            } else {
              updateVehicle(u.vehicleId, u.data);
            }
          }
          break;
      }
    };

    const client = new WebSocketClient({
      ...options,
      useWorker: true,
      onConnect: () => {
        setConnectionStatus(true);
        setIsConnecting(false);
        setError(null);

        client.subscribeToOrganization();
      },
      onDisconnect: () => {
        setConnectionStatus(false);
        setIsConnecting(false);
      },
      onMessage: (message: WebSocketMessage) => {
        handleMessage(message);
        onMessage?.(message);
      },
      onError: (err: Error) => {
        setError(err);
        setIsConnecting(false);
        onError?.(err);
      },
    });

    clientRef.current = client;
    setIsConnecting(true);

    client.connect().catch((err) => {
      setError(err);
      setIsConnecting(false);
    });

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [
    autoConnect,
    options,
    onMessage,
    onError,
    setConnectionStatus,
    updateVehicle,
    applyVehicleUpdates,
    updateVehicleWithRoadSnapping,
  ]);

  const connect = () => {
    if (!clientRef.current) return;
    setIsConnecting(true);
    clientRef.current.connect().catch((err) => {
      setError(err);
      setIsConnecting(false);
    });
  };

  const disconnect = () => {
    clientRef.current?.disconnect();
    setConnectionStatus(false);
  };

  const send = (data: unknown) => {
    clientRef.current?.send(data);
  };

  const subscribeToVehicles = (vehicleIds: string[]) => {
    clientRef.current?.subscribeToVehicleUpdates(vehicleIds);
  };

  return {
    isConnected: clientRef.current?.connected ?? false,
    isConnecting,
    error,
    connect,
    disconnect,
    send,
    subscribeToVehicles,
  };
}
