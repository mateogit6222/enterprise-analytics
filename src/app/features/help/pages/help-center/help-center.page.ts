import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * @component HelpCenterPage
 * @description Centro de Ayuda y Manual de Usuario interactivo.
 */
@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Centro de Ayuda</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Manual y Documentación</ion-card-title>
          <ion-card-subtitle>Ruta accesible para todos los usuarios autenticados</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>Manual interactivo de usuario previsto para la Fase 4.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpCenterPage {}
