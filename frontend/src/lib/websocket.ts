type EventHandler = (data: unknown) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private _status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private subscriptions: Set<string> = new Set();

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  get status() {
    return this._status;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this._status = 'connecting';
    this.emit('status', this._status);

    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);

      this.ws.onopen = () => {
        this._status = 'connected';
        this.reconnectAttempts = 0;
        this.emit('status', this._status);
        this.startHeartbeat();

        // Re-subscribe to channels
        this.subscriptions.forEach((channel) => {
          this.send({ type: 'subscribe', channel });
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          const eventType = data.type as string;
          this.emit(eventType, data);
          if (data.channel) {
            this.emit(`channel:${data.channel}`, data);
          }
        } catch {
          // Non-JSON message
          this.emit('message', event.data);
        }
      };

      this.ws.onclose = () => {
        this._status = 'disconnected';
        this.emit('status', this._status);
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.emit('error', { message: 'WebSocket error' });
      };
    } catch {
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this._status = 'disconnected';
    this.emit('status', this._status);
  }

  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', channel });
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', channel });
    }
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this._status = 'reconnecting';
    this.emit('status', this._status);
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
