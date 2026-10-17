import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';

/**
 * @class AuthEffects
 * @description Efectos secundarios de NgRx para el módulo de autenticación.
 *
 * Los Effects son el puente entre las acciones despachadas y los
 * servicios asíncronos (AuthService). Escuchan acciones específicas,
 * ejecutan operaciones asíncronas y despachan nuevas acciones
 * con el resultado.
 *
 * @remarks
 * Se utiliza `exhaustMap` en lugar de `switchMap` para los flujos
 * de login/register, evitando que múltiples clicks rápidos
 * generen peticiones duplicadas.
 *
 * Flujos implementados:
 * - Login → AuthService.login() → Login Success / Login Failure
 * - Register → AuthService.register() → Register Success / Register Failure
 * - Login Success / Register Success → Navegación al Dashboard o Records
 * - Logout → AuthService.logout() → Navegación a Login
 */
@Injectable()
export class AuthEffects {

  /** @private Inyección de dependencias */
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Efecto de login: llama al AuthService y mapea la respuesta
   * a acciones de éxito o fallo.
   *
   * @type {Observable<Action>}
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({
            error: error.message || 'Error de conexión durante el login.'
          })))
        )
      )
    )
  );

  /**
   * Efecto de registro: llama al AuthService y mapea la respuesta.
   *
   * @type {Observable<Action>}
   */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ data }) =>
        this.authService.register(data).pipe(
          map(response => AuthActions.registerSuccess({ response })),
          catchError(error => of(AuthActions.registerFailure({
            error: error.message || 'Error de conexión durante el registro.'
          })))
        )
      )
    )
  );

  /**
   * Efecto de navegación post-login/registro exitoso.
   * Redirige a Dashboard (si es Admin) o Records (si es User).
   *
   * @description No despacha acción (`dispatch: false`) porque
   * solo produce un efecto secundario de navegación.
   *
   * @type {Observable<void>}
   */
  loginOrRegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ response }) => {
        const targetRoute = response.user.role === 'ADMIN'
          ? '/dashboard'
          : '/records';
        this.router.navigate([targetRoute]);
      })
    ),
    { dispatch: false }
  );

  /**
   * Efecto de logout: limpia la sesión y redirige a login.
   *
   * @type {Observable<void>}
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );
}
