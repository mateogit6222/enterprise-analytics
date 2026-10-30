import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole, Permission } from '../../core/models/user.model';

/**
 * Directiva estructural reactiva para control de acceso RBAC a nivel de plantilla HTML (`*appHasRole`).
 *
 * Evalúa los roles y permisos del usuario activo contra los requerimientos especificados
 * utilizando Angular Signals y `effect()`. Si el usuario no cumple los criterios,
 * el elemento del DOM ni siquiera se renderiza (a diferencia de un simple `[hidden]`,
 * lo cual impide la inspección visual en las herramientas de desarrollo).
 *
 * @example
 * ```html
 * <!-- Solo visible para administradores -->
 * <button *appHasRole="'ADMIN'" (click)="deleteRecord()">Eliminar</button>
 *
 * <!-- Visible para ADMIN o AUDITOR -->
 * <div *appHasRole="['ADMIN', 'AUDITOR']">Panel de Auditoría</div>
 *
 * <!-- Con plantilla alternativa (else) -->
 * <section *appHasRole="'ADMIN'; else userNotice">
 *   <p>Opciones avanzadas</p>
 * </section>
 * <ng-template #userNotice>
 *   <p>Modo solo lectura</p>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private readonly requiredRolesSignal = signal<(UserRole | string)[]>([]);
  private readonly requiredPermissionsSignal = signal<Permission[]>([]);
  private hasView = false;

  @Input('appHasRole')
  set appHasRole(roles: UserRole | UserRole[] | string | string[] | undefined | null) {
    if (!roles) {
      this.requiredRolesSignal.set([]);
    } else if (Array.isArray(roles)) {
      this.requiredRolesSignal.set(roles);
    } else {
      this.requiredRolesSignal.set([roles]);
    }
  }

  @Input('appHasRolePermission')
  set appHasRolePermission(perms: Permission | Permission[] | undefined | null) {
    if (!perms) {
      this.requiredPermissionsSignal.set([]);
    } else if (Array.isArray(perms)) {
      this.requiredPermissionsSignal.set(perms);
    } else {
      this.requiredPermissionsSignal.set([perms]);
    }
  }

  @Input('appHasRoleElse')
  elseTemplate?: TemplateRef<unknown>;

  constructor() {
    effect(() => {
      const user = this.authService.currentUserSignal();
      const roles = this.requiredRolesSignal();
      const perms = this.requiredPermissionsSignal();

      let isAuthorized = false;

      if (user) {
        const matchesRole = roles.length === 0 || roles.some(
          r => r.toString().toUpperCase() === (user.role || '').toUpperCase()
        );
        const matchesPerms = perms.length === 0 || this.authService.hasPermission(perms);
        isAuthorized = matchesRole && matchesPerms;
      }

      if (isAuthorized && !this.hasView) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isAuthorized && this.hasView) {
        this.viewContainer.clear();
        if (this.elseTemplate) {
          this.viewContainer.createEmbeddedView(this.elseTemplate);
        }
        this.hasView = false;
      } else if (!isAuthorized && !this.hasView && this.elseTemplate) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.elseTemplate);
      }
    });
  }
}

