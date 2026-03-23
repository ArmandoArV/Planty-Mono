/**
 * @module services/device-keys
 * Manage static API keys that Arduino devices use to authenticate.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type {
  DeviceKey,
  CreateDeviceKeyRequest,
  MessageResponse,
} from "../types";

export class DeviceKeysService {
  constructor(private readonly http: HttpClient) {}

  /** List all device keys for the authenticated user. */
  list(signal?: AbortSignal): Promise<DeviceKey[]> {
    return this.http.get<DeviceKey[]>(Routes.DeviceKeys.List, signal);
  }

  /**
   * Generate a new device key bound to a specific plant.
   *
   * @param data - plant_id (required), label (optional)
   * @returns The created device key (including the raw key string — show once!)
   */
  create(data: CreateDeviceKeyRequest, signal?: AbortSignal): Promise<DeviceKey> {
    return this.http.post<DeviceKey>(Routes.DeviceKeys.Create, data, signal);
  }

  /**
   * Revoke (deactivate) a device key. The Arduino using it will get 401s.
   *
   * @param keyId - UUID of the device key
   */
  revoke(keyId: string, signal?: AbortSignal): Promise<MessageResponse> {
    return this.http.del<MessageResponse>(Routes.DeviceKeys.Revoke(keyId), signal);
  }
}
