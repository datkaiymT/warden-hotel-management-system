# WARDEN Service Layer

This folder is the boundary between the UI and any backend transport.

- `types.ts` — contracts (`SensorService`, `RobotService`, `AlertService`, …).
- `mock.ts` — current implementation, backed by the in-memory Zustand store.
- `index.ts` — the active `services` export the UI imports from.

## Integrating real sensors

1. Add a new adapter, e.g. `ros2.ts`, exporting a `ServiceBundle`.
2. Inside each method, talk to the real transport (WebSocket, REST, MQTT).
3. Swap the export in `index.ts`, optionally behind an env flag:

   ```ts
   const useReal = import.meta.env.VITE_USE_REAL_SENSORS === "true";
   export const services = useReal ? ros2Services : mockServices;
   ```

4. No UI changes required as long as the contract is honored.

## Streaming

Subscribe methods return an `Unsubscribe` function. Always store it and
call on cleanup in `useEffect`:

```ts
useEffect(() => services.sensors.subscribe(setReading), []);
```
