/**
 * Service registry — single import surface for the UI.
 *
 *   import { services } from "@/services";
 *   const reading = await services.sensors.getCurrent();
 *
 * To wire a real backend, create a new adapter file (e.g. `./ros2.ts`)
 * that implements `ServiceBundle` from `./types.ts`, then switch the
 * `services` export below. Optionally gate on an env flag:
 *
 *   const useReal = import.meta.env.VITE_USE_REAL_SENSORS === "true";
 *   export const services = useReal ? ros2Services : mockServices;
 */
import { mockServices } from "./mock";
import type { ServiceBundle } from "./types";

export const services: ServiceBundle = mockServices;
export type { ServiceBundle } from "./types";
export * from "./types";
