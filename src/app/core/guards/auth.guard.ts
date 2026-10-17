import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional de autenticación.
 *
 * Protege rutas que requieren que el usuario esté autenticado.
 * Si el usuario no tiene sesión activa, redirige a la página de login.
 *
 * @description
 * Implementado como `CanActivateFn` (patrón funcional de Angular 15+)
 * en lugar de una clase con interfaz `CanActivate`, siguiendo las
 * mejores prácticas modernas de Angular.
 *
 * @param {ActivatedRouteSnapshot} route - Snapshot de la ruta activada.
 * @param {RouterStateSnapshot} state - Estado actual del router.
 * @returns {Observable<boolean | UrlTree>} Observable que emite `true` si
 *   el usuario está autenticado, o un `UrlTree` hacia `/auth/login` si no lo está.
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'dashboard',
 *   canActivate: [authGuard],
 *   loadComponent: () => import('./features/dashboard/...')
 * }
 * ```
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      /** Redirigir a login preservando la URL de retorno */
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
