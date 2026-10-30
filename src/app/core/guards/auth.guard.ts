import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional de autenticación para activación de vistas (CanActivateFn).
 *
 * Protege rutas que requieren una sesión autenticada activa.
 * Si el usuario no ha iniciado sesión, redirige a /auth/login preservando
 * la URL original en el query parameter `returnUrl` para redirección post-login.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};

/**
 * Guard funcional de autenticación para coincidencia de rutas (CanMatchFn).
 *
 * Se evalúa antes de descargar los chunks perezosos (lazy-loaded modules/components).
 * Evita la transferencia innecesaria de scripts y previene filtración de bundles a
 * usuarios no autenticados en el navegador.
 */
export const authMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const targetUrl = '/' + segments.map(s => s.path).join('/');

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      return router.createUrlTree(['/auth/login'], {
        queryParams: targetUrl !== '/' ? { returnUrl: targetUrl } : undefined
      });
    })
  );
};
