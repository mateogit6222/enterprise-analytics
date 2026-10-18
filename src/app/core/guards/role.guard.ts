import { inject } from '@angular/core';
import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard funcional de autorización por rol.
 *
 * Protege rutas que requieren un rol específico (normalmente ADMIN).
 * Utiliza `CanMatchFn` para que la ruta ni siquiera sea considerada
 * en el matching si el usuario no tiene el rol requerido.
 *
 * @description
 * El rol requerido se especifica en el campo `data` de la configuración
 * de ruta mediante la clave `requiredRole`.
 *
 * A diferencia de `authGuard` (que usa `CanActivateFn`), este guard
 * usa `CanMatchFn` para actuar durante la fase de matching de rutas,
 * lo que permite que Angular pruebe rutas alternativas si esta no coincide.
 *
 * @param {Route} route - Definición de la ruta que se intenta activar.
 * @param {UrlSegment[]} segments - Segmentos de URL procesados.
 * @returns {Observable<boolean>} Observable que emite `true` si el usuario
 *   tiene el rol requerido.
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'dashboard',
 *   canMatch: [roleGuard],
 *   data: { requiredRole: UserRole.ADMIN },
 *   loadComponent: () => import('./features/dashboard/...')
 * }
 * ```
 */
export const roleGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /** Obtener el rol requerido desde la configuración de la ruta */
  const requiredRole = route.data?.['requiredRole'] as UserRole;

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      /** Si no hay usuario autenticado, denegar */
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      /** Verificar si el usuario tiene el rol requerido */
      if (requiredRole && user.role !== requiredRole) {
        /** Redirigir a la vista por defecto del usuario (registros) */
        router.navigate(['/records']);
        return false;
      }

      return true;
    })
  );
};
