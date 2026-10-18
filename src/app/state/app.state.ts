import { AuthState } from './auth/auth.reducer';
import { DataState } from './data/data.reducer';

/**
 * @description Interfaz raíz del estado global de la aplicación (NgRx Store).
 *
 * Cada feature module añade su propio sub-estado como propiedad
 * de esta interfaz. Esto proporciona tipado completo en toda la app.
 *
 * @interface AppState
 * @property {AuthState} auth - Sub-estado de autenticación y sesión.
 * @property {DataState} data - Sub-estado de datos empresariales, KPIs y filtros.
 */
export interface AppState {
  auth: AuthState;
  data: DataState;
}
