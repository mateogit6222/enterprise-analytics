import { AuthState } from './auth/auth.reducer';

/**
 * @description Interfaz raíz del estado global de la aplicación (NgRx Store).
 *
 * Cada feature module añade su propio sub-estado como propiedad
 * de esta interfaz. Esto proporciona tipado completo en toda la app.
 *
 * @interface AppState
 * @property {AuthState} auth - Sub-estado de autenticación y sesión.
 */
export interface AppState {
  auth: AuthState;
}
