import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * @component ReportViewerPage
 * @description Visor de Informes y Exportación a PDF/CSV (Solo Administradores).
 */
@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Informes y Exportación</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Generación de Informes</ion-card-title>
          <ion-card-subtitle>Ruta protegida para Administradores (RoleGuard: ADMIN)</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>Módulo de exportación con jsPDF y formateo de datos previsto para la Fase 4.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportViewerPage {}
