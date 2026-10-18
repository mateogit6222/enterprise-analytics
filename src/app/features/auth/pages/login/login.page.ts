import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../../state/app.state';
import { AuthActions } from '../../../../state/auth/auth.actions';
import {
  selectAuthError,
  selectIsLoading
} from '../../../../state/auth/auth.selectors';

/**
 * @component LoginPage
 * @description Página de inicio de sesión con formulario reactivo.
 *
 * Características implementadas:
 * - Formulario reactivo con validaciones síncronas (required, email, minLength).
 * - Data Binding bidireccional vía `formControlName`.
 * - Gestión del estado vía NgRx (dispatch Login, select error/loading).
 * - Estrategia de detección de cambios `OnPush` para rendimiento óptimo.
 * - Mensajes de error UX con feedback visual inmediato.
 * - Limpieza de suscripciones en `ngOnDestroy` para evitar memory leaks.
 * - Soporte `returnUrl` para redirigir tras login exitoso.
 * - Accesibilidad: etiquetas ARIA, navegación por teclado, alto contraste.
 *
 * @example
 * ```
 * Ruta: /auth/login
 * Ruta con retorno: /auth/login?returnUrl=/dashboard
 * ```
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage implements OnInit, OnDestroy {

  /** @private Inyección de dependencias */
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store<AppState>);
  private readonly activatedRoute = inject(ActivatedRoute);

  /** @private Subject para limpiar suscripciones en OnDestroy */
  private readonly destroy$ = new Subject<void>();

  /** Formulario reactivo de login */
  loginForm!: FormGroup;

  /** Observable del estado de carga desde NgRx */
  isLoading$ = this.store.select(selectIsLoading);

  /** Observable del error desde NgRx */
  error$ = this.store.select(selectAuthError);

  /** URL de retorno tras login exitoso */
  returnUrl = '/records';

  /** Controla la visibilidad de la contraseña */
  showPassword = false;

  /** Indica si se ha mostrado el mensaje de sesión expirada */
  sessionExpired = false;

  /**
   * Inicializa el formulario reactivo y lee parámetros de la URL.
   *
   * @description
   * - Crea el FormGroup con validadores síncronos.
   * - Lee `returnUrl` y `sessionExpired` de los query params.
   * - Limpia errores previos del store.
   */
  ngOnInit(): void {
    /** Inicializar formulario reactivo con validadores */
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });

    /** Leer query params */
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['returnUrl']) {
          this.returnUrl = params['returnUrl'];
        }
        if (params['sessionExpired'] === 'true') {
          this.sessionExpired = true;
        }
      });

    /** Limpiar errores previos al entrar a la página */
    this.store.dispatch(AuthActions.clearError());
  }

  /**
   * Limpia suscripciones al destruir el componente.
   * Previene memory leaks siguiendo las mejores prácticas de Angular.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Envía el formulario de login al NgRx Store.
   *
   * @description
   * Solo despacha la acción si el formulario es válido.
   * Marca todos los campos como `touched` para mostrar errores
   * si el usuario intenta enviar un formulario incompleto.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.store.dispatch(AuthActions.login({
      credentials: this.loginForm.value
    }));
  }

  /**
   * Alterna la visibilidad de la contraseña.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Rellena el formulario con credenciales de demo.
   *
   * @param {'admin' | 'user'} role - Rol para el cual rellenar las credenciales.
   */
  fillDemoCredentials(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.loginForm.patchValue({
        email: 'admin@enterprise.com',
        password: 'Admin2026!'
      });
    } else {
      this.loginForm.patchValue({
        email: 'user@enterprise.com',
        password: 'User2026!'
      });
    }
  }

  /**
   * Helper para acceder a los controles del formulario en el template.
   *
   * @param {string} field - Nombre del campo.
   * @returns {AbstractControl} Control del formulario.
   */
  getControl(field: string) {
    return this.loginForm.get(field);
  }
}
