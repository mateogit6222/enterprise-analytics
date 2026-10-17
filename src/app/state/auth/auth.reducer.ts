import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

/**
 * @description Interfaz del estado de autenticación en el NgRx Store.
 *
 * @interface AuthState
 * @property {User | null} user - Usuario autenticado o null si no hay sesión.
 * @property {boolean} isAuthenticated - Indica si hay una sesión activa.
 * @property {boolean} isLoading - Indica si hay una operación de auth en curso.
 * @property {string | null} error - Mensaje del último error, o null si no hay error.
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Estado inicial del módulo de autenticación.
 *
 * @constant
 * @type {AuthState}
 */
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

/**
 * Reducer de autenticación.
 *
 * @description
 * Función pura que calcula el nuevo estado a partir del estado actual
 * y una acción despachada. Sigue el principio de inmutabilidad
 * usando el spread operator para crear nuevos objetos de estado.
 *
 * @remarks
 * Transiciones de estado:
 * - `Login` / `Register` → `isLoading: true`, `error: null`
 * - `Login Success` / `Register Success` → `user: payload`, `isAuthenticated: true`
 * - `Login Failure` / `Register Failure` → `error: payload`, `isLoading: false`
 * - `Logout` → vuelve al `initialAuthState`
 * - `Restore Session` → restaura usuario sin pasar por loading
 */
export const authReducer = createReducer(
  initialAuthState,

  /** === FLUJO DE LOGIN === */

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error
  })),

  /** === FLUJO DE REGISTRO === */

  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  /** === LOGOUT === */

  on(AuthActions.logout, () => ({
    ...initialAuthState
  })),

  /** === UTILIDADES === */

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  on(AuthActions.restoreSession, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  }))
);
