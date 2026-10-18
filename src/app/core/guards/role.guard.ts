import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, ActivatedRouteSnapshot, Route, UrlSegment, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard funcional de autorización por rol.
 *
 * Protege rutas que requieren un rol específico (normalmente ADMIN).
 * Compatible tanto con `canActivate` como con `canMatch`.
 *
 * @param {ActivatedRouteSnapshot | Route} route - Definición de la ruta que se intenta activar.
 * @returns {Observable<boolean>} Observable que emite `true` si el usuario tiene el rol requerido.
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot | Route,
  state?: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /** Obtener el rol requerido desde la configuración de la ruta */
  const requiredRole = route.data?.['requiredRole'] as UserRole;

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      /** Si no hay usuario autenticado, denegar y enviar a login */
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      /** Comparación insensible a mayúsculas/minúsculas para robustez total */
      const userRole = (user.role || '').toString().toUpperCase();
      const targetRole = (requiredRole || '').toString().toUpperCase();

      if (targetRole && userRole !== targetRole) {
        /** Redirigir a la vista por defecto del usuario (registros) */
        router.navigate(['/records']);
        return false;
      }

      return true;
    })
  );
};
