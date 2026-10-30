import { ApplicationConfig, LOCALE_ID, isDevMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authReducer } from './state/auth/auth.reducer';
import { AuthEffects } from './state/auth/auth.effects';
import { dataReducer } from './state/data/data.reducer';
import { DataEffects } from './state/data/data.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localeEs, 'es');

/**
 * Configuración unificada de proveedores para la arquitectura 100% Standalone (Angular 22 / Ionic 9).
 *
 * Registra:
 * - Estrategia de reciclado de rutas optimizada para Ionic (`IonicRouteStrategy`).
 * - Configuración regional española (`LOCALE_ID = 'es'`).
 * - Proveedores de Ionic Angular (`provideIonicAngular`).
 * - Enrutamiento con precarga proactiva (`PreloadAllModules`).
 * - Cliente HTTP con interceptores funcionales inmutables (`authInterceptor`, `errorInterceptor`).
 * - Almacén global reactivo NgRx (`provideStore`, `provideEffects`, `provideStoreDevtools`).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es' },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideStore({
      auth: authReducer,
      data: dataReducer
    }),
    provideEffects([AuthEffects, DataEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'Enterprise Analytics NgRx Store'
    })
  ]
};

