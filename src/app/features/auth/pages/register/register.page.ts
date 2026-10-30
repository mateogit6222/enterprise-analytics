import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError, first } from 'rxjs/operators';
import { AppState } from '../../../../state/app.state';
import { AuthActions } from '../../../../state/auth/auth.actions';
import { AuthService } from '../../../../core/services/auth.service';
import { selectAuthError, selectIsLoading } from '../../../../state/auth/auth.selectors';

/**
 * Validador para contraseñas complejas:
 * - Mínimo 8 caracteres
 * - Al menos 1 letra mayúscula
 * - Al menos 1 letra minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial (@$!%*?&#)
 */
export function strongPasswordValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[@$!%*?&#]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return passwordValid
      ? null
      : {
          strongPassword: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar
          }
        };
  };
}

/**
 * Validador cruzado (cross-field) para verificar coincidencia de contraseñas.
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    confirmPassword.setErrors(null);
    return null;
  }
}

/**
 * Validador asíncrono para verificar si el email ya existe en el sistema.
 */
export function emailAvailableValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }
    return authService.checkEmailExists(control.value).pipe(
      first(),
      map(isTaken => (isTaken ? { emailTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}

/**
 * @component RegisterPage
 * @description Página de registro de nuevo usuario con validación compleja y asíncrona.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonContent],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store<AppState>);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  /** Formulario reactivo de registro */
  registerForm!: FormGroup;

  /** Observables NgRx */
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError);

  /** Visibilidad de contraseñas */
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: [
          '',
          [Validators.required, Validators.email],
          [emailAvailableValidator(this.authService)]
        ],
        password: [
          '',
          [Validators.required, Validators.minLength(8), strongPasswordValidator()]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: [passwordMatchValidator]
      }
    );

    this.store.dispatch(AuthActions.clearError());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.value;

    this.store.dispatch(
      AuthActions.register({
        data: { firstName, lastName, email, password, confirmPassword }
      })
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getControl(field: string): AbstractControl | null {
    return this.registerForm.get(field);
  }
}
