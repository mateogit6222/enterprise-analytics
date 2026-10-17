import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * @component RecordListPage
 * @description Vista principal de gestión de registros para todos los usuarios autenticados.
 */
@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Registros</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Registros Empresariales</ion-card-title>
          <ion-card-subtitle>Ruta protegida por AuthGuard</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>Has iniciado sesión correctamente. La autenticación y roles de la Fase 1 funcionan al 100%.</p>
          <p>La tabla de datos avanzada (DataTable) se integrará en la Fase 2 y los datos SQL/NoSQL en la Fase 3.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordListPage {}
