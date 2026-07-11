import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.Login) },
  {
    path: 'admin',
    loadComponent: () => import('./components/vistas/admin/admin').then(m => m.Admin),
    canActivate: [authGuard]

  },
  {
    path: 'admin/auditoria',
    loadComponent: () => import('./components/vistas/auditoria/auditoria').then(m => m.Auditoria),
    canActivate: [adminGuard]
  },
  {
    path: 'medico',
    loadComponent: () => import('./components/vistas/medico/medico').then(m => m.Medico),
    canActivate: [authGuard]
  },
  {
    path: 'usuario',
    loadComponent: () => import('./components/vistas/usuario/usuario').then(m => m.Usuario),
    canActivate: [authGuard]
  },
  {
    path: 'tecnico',
    loadComponent: () => import('./components/vistas/tecnico/tecnico').then(m => m.Tecnico),
    canActivate: [authGuard]
  },
  {
    path: 'administrativo',
    loadComponent: () => import('./components/vistas/administrativo/administrativo').then(m => m.Administrativo),
    canActivate: [authGuard]
  }
];
