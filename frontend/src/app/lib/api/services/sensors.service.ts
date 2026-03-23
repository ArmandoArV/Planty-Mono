/**
 * @module services/sensors
 * Sensor reading CRUD — store & retrieve Arduino data points per plant.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type {
  SensorReading,
  PlantId,
  CreateReadingRequest,
} from "../types";

export class SensorsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Store a new sensor data point for a plant.
   * If `plant_mood` is omitted, the backend stored procedure derives it
   * from moisture thresholds (≥66.66 → happy, ≥33.33 → normal, <33.33 → sad).
   *
   * @param plantId - the plant this reading belongs to
   * @param data - moisture (0-100), optional pump_on, optional plant_mood
   * @returns The created reading with server-generated id and timestamp
   * @throws {ApiError} 404 if plant not found or not owned by user
   */
  create(
    plantId: PlantId,
    data: CreateReadingRequest,
    signal?: AbortSignal,
  ): Promise<SensorReading> {
    return this.http.post<SensorReading>(Routes.Readings.Create(plantId), data, signal);
  }

  /**
   * List sensor readings for a plant (newest first, limit 100).
   *
   * @param plantId - the plant to query
   * @returns Array of readings, ordered by created_at DESC
   * @throws {ApiError} 404 if plant not found
   */
  list(plantId: PlantId, signal?: AbortSignal): Promise<SensorReading[]> {
    return this.http.get<SensorReading[]>(Routes.Readings.List(plantId), signal);
  }

  /**
   * Fetch the most recent sensor reading for a plant.
   *
   * @param plantId - the plant to query
   * @returns The latest reading
   * @throws {ApiError} 404 if no readings exist yet
   */
  latest(plantId: PlantId, signal?: AbortSignal): Promise<SensorReading> {
    return this.http.get<SensorReading>(Routes.Readings.Latest(plantId), signal);
  }
}
