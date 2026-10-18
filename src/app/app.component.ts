import { Component, OnInit, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './state/app.state';
import { AuthActions } from './state/auth/auth.actions';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectUserFullName,
  selectUserRoleLabel
} from './state/auth/auth.selectors';
import { AuthService } from './core/services/auth.service';
import { AccessibilityService } from './core/services/accessibility.service';

/**
 * @interface NavigationItem
 * @description Estructura de elementos del menú lateral.
 */
interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  adminOnly?: boolean;
}

/**
 * @component AppComponent
 * @description Shell principal de la aplicación con Split Pane, Side Menu adaptativo por roles,
 * soporte de atajos de teclado globales y enlace de salto para accesibilidad WCAG.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly authService = inject(AuthService);
  private readonly accessibilityService = inject(AccessibilityService);
  private readonly router = inject(Router);

  /** Observables de estado de autenticación desde NgRx */
  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  readonly isAdmin$ = this.store.select(selectIsAdmin);
  readonly userFullName$ = this.store.select(selectUserFullName);
  readonly userRoleLabel$ = this.store.select(selectUserRoleLabel);

  /** Elementos del menú de navegación */
  readonly appPages: NavigationItem[] = [
    { title: 'Dashboard Analítico', url: '/dashboard', icon: 'bar-chart-outline', adminOnly: true },
    { title: 'Gestión de Registros', url: '/records', icon: 'grid-outline' },
    { title: 'Informes y Exportación', url: '/reports', icon: 'document-text-outline', adminOnly: true },
    { title: 'Centro de Ayuda', url: '/help', icon: 'help-circle-outline' },
    { title: 'Mi Perfil', url: '/profile', icon: 'person-circle-outline' }
  ];

  ngOnInit(): void {
    /** Restaurar sesión previa si existe en almacenamiento local */
    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      this.store.dispatch(AuthActions.restoreSession({ user: storedUser }));
    }
  }

  /**
   * Cierra la sesión del usuario actual despachando la acción de NgRx.
   */
  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  /**
   * Atajos de teclado globales para navegación accesible sin ratón (WCAG 2.1 - RA 4).
   * - Alt + D: Dashboard
   * - Alt + R: Registros
   * - Alt + I: Informes
   * - Alt + H: Centro de Ayuda
   * - Alt + P: Mi Perfil
   *
   * @param {KeyboardEvent} event - Evento nativo de teclado.
   */
  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (!event.altKey) return;

    switch (event.key.toLowerCase()) {
      case 'd':
        event.preventDefault();
        this.router.navigate(['/dashboard']);
        break;
      case 'r':
        event.preventDefault();
        this.router.navigate(['/records']);
        break;
      case 'i':
        event.preventDefault();
        this.router.navigate(['/reports']);
        break;
      case 'h':
        event.preventDefault();
        this.router.navigate(['/help']);
        break;
      case 'p':
        event.preventDefault();
        this.router.navigate(['/profile']);
        break;
    }
  }
}
