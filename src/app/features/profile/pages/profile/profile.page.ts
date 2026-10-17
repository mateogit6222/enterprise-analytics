import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../state/app.state';
import {
  selectCurrentUser,
  selectUserFullName,
  selectUserRoleLabel
} from '../../../../state/auth/auth.selectors';

/**
 * @component ProfilePage
 * @description Vista del perfil del usuario conectado con detalles de cuenta.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (currentUser$ | async; as user) {
        <ion-card>
          <ion-card-header>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
              <ion-avatar style="width: 56px; height: 56px; border: 2px solid #6366f1;">
                <img [src]="user.avatarUrl" [alt]="'Avatar de ' + (userFullName$ | async)" />
              </ion-avatar>
              <div>
                <ion-card-title>{{ userFullName$ | async }}</ion-card-title>
                <ion-card-subtitle>{{ user.email }}</ion-card-subtitle>
              </div>
            </div>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="inset">
              <ion-item>
                <ion-label>Rol Asignado</ion-label>
                <ion-note slot="end" color="primary">{{ userRoleLabel$ | async }}</ion-note>
              </ion-item>
              <ion-item>
                <ion-label>Estado de Cuenta</ion-label>
                <ion-note slot="end" color="success">{{ user.isActive ? 'Activa' : 'Inactiva' }}</ion-note>
              </ion-item>
              <ion-item>
                <ion-label>Último Acceso</ion-label>
                <ion-note slot="end">{{ user.lastLoginAt | date:'medium' }}</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {
  private readonly store = inject(Store<AppState>);
  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly userFullName$ = this.store.select(selectUserFullName);
  readonly userRoleLabel$ = this.store.select(selectUserRoleLabel);
}
