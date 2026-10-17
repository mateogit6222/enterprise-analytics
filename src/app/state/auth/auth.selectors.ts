import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { UserRole } from '../../core/models/user.model';

/**
 * @description Selectores NgRx para el estado de autenticación.
 *
 * Los selectores son funciones puras memoizadas que extraen
 * fragmentos específicos del estado. Se utilizan en los componentes
 * con `store.select(selector)` para obtener datos reactivos.
 *
 * @remarks
 * La memoización de `createSelector` evita recálculos innecesarios
 * cuando el estado relevante no ha cambiado, lo cual es fundamental
 * para la estrategia `ChangeDetectionStrategy.OnPush`.
 */

/**
 * Selector raíz del feature 'auth'.
 * Obtiene el sub-estado completo de autenticación.
 */
export const selectAuthState = createFeatureSelector<AuthState>('auth');

/**
 * Selector del usuario actual.
 * @returns {User | null} Usuario autenticado o null.
 */
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

/**
 * Selector del estado de autenticación.
 * @returns {boolean} `true` si hay sesión activa.
 */
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

/**
 * Selector del estado de carga.
 * @returns {boolean} `true` si hay una operación de auth en curso.
 */
export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

/**
 * Selector del último error.
 * @returns {string | null} Mensaje de error o null.
 */
export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

/**
 * Selector derivado: ¿es el usuario un administrador?
 * @returns {boolean} `true` si el rol del usuario es ADMIN.
 */
export const selectIsAdmin = createSelector(
  selectCurrentUser,
  (user) => user?.role === UserRole.ADMIN
);

/**
 * Selector derivado: nombre completo del usuario.
 * @returns {string} Nombre y apellido concatenados, o cadena vacía.
 */
export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);

/**
 * Selector derivado: rol legible del usuario.
 * @returns {string} 'Administrador', 'Usuario Estándar' o ''.
 */
export const selectUserRoleLabel = createSelector(
  selectCurrentUser,
  (user) => {
    if (!user) return '';
    return user.role === UserRole.ADMIN ? 'Administrador' : 'Usuario Estándar';
  }
);
