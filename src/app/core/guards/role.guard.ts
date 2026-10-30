import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, ActivatedRouteSnapshot, Route, UrlSegment, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole, Permission } from '../models/user.model';

/**
 * Guard funcional de autorización basado en roles y permisos para activación (CanActivateFn).
 *
 * Lee `data.requiredRole` (o `data.requiredRoles`, `data.requiredPermissions`) en la ruta activa.
 * - Si no hay sesión: redirige a `/auth/login` con `returnUrl`.
 * - Si la sesión carece de los privilegios requeridos: redirige a `/records` (área autorizada general).
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rawRole = route.data?.['requiredRole'] ?? route.data?.['requiredRoles'];
  const requiredRoles: UserRole[] = rawRole
    ? (Array.isArray(rawRole) ? rawRole : [rawRole])
    : [];

  const rawPerms = route.data?.['requiredPermissions'] ?? route.data?.['requiredPermission'];
  const requiredPermissions: Permission[] = rawPerms
    ? (Array.isArray(rawPerms) ? rawPerms : [rawPerms])
    : [];

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      if (requiredRoles.length > 0) {
        const hasMatchingRole = requiredRoles.some(r => r.toUpperCase() === (user.role || '').toUpperCase());
        if (!hasMatchingRole) {
          return router.createUrlTree(['/records'], {
            queryParams: { forbidden: 'role_required' }
          });
        }
      }

      if (requiredPermissions.length > 0) {
        const hasAllPerms = authService.hasPermission(requiredPermissions);
        if (!hasAllPerms) {
          return router.createUrlTree(['/records'], {
            queryParams: { forbidden: 'permission_required' }
          });
        }
      }

      return true;
    })
  );
};

/**
 * Guard funcional de autorización basado en roles para coincidencia de rutas (CanMatchFn).
 *
 * Se ejecuta en fase de emparejamiento de ruta (antes de descargar el bundle JS perezoso).
 * Si el usuario no tiene el rol necesario, cancela la coincidencia o redirige a la ruta segura,
 * impidiendo la descarga de código restringido.
 */
export const roleMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rawRole = route.data?.['requiredRole'] ?? route.data?.['requiredRoles'];
  const requiredRoles: UserRole[] = rawRole
    ? (Array.isArray(rawRole) ? rawRole : [rawRole])
    : [];

  const rawPerms = route.data?.['requiredPermissions'] ?? route.data?.['requiredPermission'];
  const requiredPermissions: Permission[] = rawPerms
    ? (Array.isArray(rawPerms) ? rawPerms : [rawPerms])
    : [];

  const targetUrl = '/' + segments.map(s => s.path).join('/');

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: targetUrl !== '/' ? { returnUrl: targetUrl } : undefined
        });
      }

      if (requiredRoles.length > 0) {
        const hasMatchingRole = requiredRoles.some(r => r.toUpperCase() === (user.role || '').toUpperCase());
        if (!hasMatchingRole) {
          return router.createUrlTree(['/records'], {
            queryParams: { forbidden: 'role_required' }
          });
        }
      }

      if (requiredPermissions.length > 0) {
        const hasAllPerms = authService.hasPermission(requiredPermissions);
        if (!hasAllPerms) {
          return router.createUrlTree(['/records'], {
            queryParams: { forbidden: 'permission_required' }
          });
        }
      }

      return true;
    })
  );
};
