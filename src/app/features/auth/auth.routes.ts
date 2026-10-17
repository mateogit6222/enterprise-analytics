import { Routes } from '@angular/router';

/**
 * Rutas del módulo de autenticación con Lazy Loading.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
    title: 'Iniciar Sesión | Enterprise Analytics'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage),
    title: 'Crear Cuenta | Enterprise Analytics'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
