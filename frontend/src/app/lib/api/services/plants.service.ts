/**
 * @module services/plants
 * Plant CRUD + pump control for the authenticated user.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type {
  Plant,
  PlantId,
  CreatePlantRequest,
  UpdatePlantRequest,
  MessageResponse,
} from "../types";

export class PlantsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all plants owned by the authenticated user, newest first.
   *
   * @returns Array of plants (may be empty)
   */
  list(signal?: AbortSignal): Promise<Plant[]> {
    return this.http.get<Plant[]>(Routes.Plants.List, signal);
  }

  /**
   * Fetch a single plant by ID.
   *
   * @param id - branded PlantId
   * @throws {ApiError} 404 if plant not found or doesn't belong to user
   */
  get(id: PlantId, signal?: AbortSignal): Promise<Plant> {
    return this.http.get<Plant>(Routes.Plants.Get(id), signal);
  }

  /**
   * Create a new plant for the authenticated user.
   *
   * @param data - name (required), species (optional)
   * @returns The created plant with generated UUID
   * @throws {ApiError} 400 if name is missing
   */
  create(data: CreatePlantRequest, signal?: AbortSignal): Promise<Plant> {
    return this.http.post<Plant>(Routes.Plants.Create, data, signal);
  }

  /**
   * Update an existing plant's name and/or species.
   *
   * @param id - branded PlantId
   * @param data - fields to update
   * @returns The updated plant
   * @throws {ApiError} 404 if not found
   */
  update(id: PlantId, data: UpdatePlantRequest, signal?: AbortSignal): Promise<Plant> {
    return this.http.put<Plant>(Routes.Plants.Update(id), data, signal);
  }

  /**
   * Soft-delete a plant.
   *
   * @param id - branded PlantId
   * @returns Confirmation message
   * @throws {ApiError} 404 if not found
   */
  delete(id: PlantId, signal?: AbortSignal): Promise<MessageResponse> {
    return this.http.del<MessageResponse>(Routes.Plants.Delete(id), signal);
  }

  /**
   * Toggle the water pump relay (flip pump_status boolean).
   *
   * @param id - branded PlantId
   * @returns The updated plant with new pump_status
   * @throws {ApiError} 404 if not found
   */
  togglePump(id: PlantId, signal?: AbortSignal): Promise<Plant> {
    return this.http.patch<Plant>(Routes.Plants.TogglePump(id), undefined, signal);
  }
}
