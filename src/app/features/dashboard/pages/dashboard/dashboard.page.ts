import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * @component DashboardPage
 * @description Vista del Dashboard Analítico para Administradores (Protegido por RoleGuard).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard Analítico</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Panel de Analítica y KPIs</ion-card-title>
          <ion-card-subtitle>Ruta protegida para Administradores (RoleGuard: ADMIN)</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>El núcleo de autenticación, guards y estado NgRx de la Fase 1 está activo y funcionando.</p>
          <p>Los widgets estadísticos y gráficos de Chart.js se integrarán en la Fase 3.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {}
