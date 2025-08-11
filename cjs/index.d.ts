// index.d.ts

/// <reference types="node" />

import { EventEmitter } from "events";

/**
 * Meta information about a connected socket/client.
 */
export interface SocketMeta {
  id: string;
  username: string;
  name?: string;
}

/**
 * Wrapped socket interface with merged socket + metadata.
 */
export interface IPCSocket {
  /**
   * Send an event with optional data to the peer.
   * @param event Event name
   * @param data Optional payload
   */
  emit(event: string, data?: any): void;

  /**
   * Listen to events originating from this socket only.
   * @param event Event name
   * @param handler Event handler callback
   */
  on(event: string, handler: (payload: any) => void): this;

  /**
   * Broadcast event to all clients except this socket (server only).
   * @param event Event name
   * @param data Optional payload
   */
  broadcast(event: string, data?: any): void;

  /**
   * Ping the remote peer (application-level).
   */
  userPing(): void;

  /**
   * Request disconnect from server/client.
   * @param reason Optional reason string
   */
  disconnect(reason?: string): void;

  /** Unique client ID */
  readonly id: string | undefined;

  /** Internal username */
  readonly username: string | undefined;

  /** Friendly client name */
  readonly name: string | undefined;

  /** Raw underlying socket */
  readonly _raw: any;
}

/**
 * IPC Server options
 */
export interface IPCServerOptions {
  /**
   * Optional password to enable AES-256-GCM encryption.
   * If omitted, no encryption is used.
   */
  password?: string;
}

/**
 * IPC Client options
 */
export interface IPCClientOptions {
  /** Friendly client name (optional) */
  name?: string;

  /** Enable automatic reconnect on disconnect */
  reconnect?: boolean;

  /** Milliseconds between reconnect attempts */
  reconnectInterval?: number;

  /** Password matching the server for encryption */
  password?: string;
}

/**
 * Base class for IPC Server and Client.
 * Extends Node.js EventEmitter.
 */
export declare abstract class IPCBase extends EventEmitter {
  protected constructor(pipeName: string, config?: any);

  /**
   * Enable encryption with a password.
   * @param password Password string
   */
  setEncryption(password: string): void;

  /**
   * Disable encryption (use plaintext).
   */
  clearEncryption(): void;
}

/**
 * IPCServer listens on a named pipe or Unix socket,
 * accepts client connections, supports encryption, broadcast,
 * and manages single active connection per client.
 */
export declare class IPCServer extends IPCBase {
  constructor(pipeName: string, options?: IPCServerOptions);

  /**
   * Start the IPC server and begin accepting clients.
   * Emits 'listening' event on success.
   */
  start(): void;

  /**
   * Stop the server and disconnect all clients.
   */
  stop(): void;

  /**
   * Force disconnect a client by its ID.
   * @param id Client ID string
   * @param reason Optional disconnect reason
   * @returns true if client found and disconnected, else false
   */
  disconnectClient(id: string, reason?: string): boolean;

  /**
   * Broadcast an event to all connected clients.
   * @param event Event name
   * @param data Optional payload
   */
  broadcastAll(event: string, data?: any): void;

  /**
   * Broadcast event to all except specified socket.
   * @param excludeWrappedOrRaw Socket to exclude (wrapped or raw)
   * @param event Event name
   * @param data Optional payload
   */
  broadcastExcept(
    excludeWrappedOrRaw: IPCSocket | any,
    event: string,
    data?: any,
  ): void;

  /**
   * Events:
   * - 'listening' (pipeName: string)
   * - 'connected' (socket: IPCSocket, meta: SocketMeta)
   * - 'disconnected' (meta: SocketMeta)
   * - 'error' (err: Error)
   */
  on(event: "listening", listener: (pipeName: string) => void): this;
  on(
    event: "connected",
    listener: (socket: IPCSocket, meta: SocketMeta) => void,
  ): this;
  on(event: "disconnected", listener: (meta: SocketMeta) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

/**
 * IPCClient connects to a named pipe or Unix socket server,
 * supports encryption, auto-reconnect, and exposes wrapped socket.
 */
export declare class IPCClient extends IPCBase {
  constructor(pipeName: string, options?: IPCClientOptions);

  /**
   * Connect to the IPC server.
   * @returns Promise resolving with wrapped IPCSocket on success.
   */
  connect(): Promise<IPCSocket>;

  /**
   * Disconnect from server and stop reconnect attempts.
   */
  disconnect(): void;

  /**
   * Events:
   * - 'connected' (socket: IPCSocket, meta: SocketMeta)
   * - 'disconnected'
   * - 'error' (err: Error)
   * - 'message' (data: any)
   */
  on(
    event: "connected",
    listener: (socket: IPCSocket, meta: SocketMeta) => void,
  ): this;
  on(event: "disconnected", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "message", listener: (data: any) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}
