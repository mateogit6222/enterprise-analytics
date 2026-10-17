import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    canMatch: [roleGuard],
    data: { requiredRole: UserRole.ADMIN },
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard.page').then(
        m => m.DashboardPage
      ),
    title: 'Dashboard Analítico | Enterprise Analytics'
  },
  {
    path: 'records',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/records/pages/record-list/record-list.page').then(
        m => m.RecordListPage
      ),
    title: 'Gestión de Registros | Enterprise Analytics'
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    canMatch: [roleGuard],
    data: { requiredRole: UserRole.ADMIN },
    loadComponent: () =>
      import('./features/reports/pages/report-viewer/report-viewer.page').then(
        m => m.ReportViewerPage
      ),
    title: 'Informes y Exportación | Enterprise Analytics'
  },
  {
    path: 'help',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/help/pages/help-center/help-center.page').then(
        m => m.HelpCenterPage
      ),
    title: 'Centro de Ayuda | Enterprise Analytics'
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/pages/profile/profile.page').then(
        m => m.ProfilePage
      ),
    title: 'Mi Perfil | Enterprise Analytics'
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
