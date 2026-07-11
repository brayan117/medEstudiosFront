import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sliderbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sliderbar.html',
  styleUrl: './sliderbar.css',
  standalone: true
})
export class Sliderbar {
  private router = inject(Router);
  private authService = inject(AuthService);

  get menuItems() {
    const role = this.authService.getRole();
    
    const roleMenus: { [key: string]: any[] } = {
      'ADMIN': [
        { icon: '🏠', label: 'Dashboard', path: '/admin' },
        { icon: '📊', label: 'Auditoria', path: '/admin/auditoria' },
        { icon: '⚙️', label: 'Configuración', path: '/admin/settings' }
      ],
      'MEDICO': [
        { icon: '🏠', label: 'Dashboard', path: '/medico' },
        { icon: '📁', label: 'Historial', path: '/medico/history' },
        { icon: '📊', label: 'Reportes', path: '/medico/reports' }
      ],
      'TECNICO': [
        { icon: '🏠', label: 'Dashboard', path: '/tecnico' },
        { icon: '📋', label: 'Estudios Pendientes', path: '/tecnico/pending' },
        { icon: '📁', label: 'Historial', path: '/tecnico/history' }
      ],
      'ADMINISTRATIVO': [
        { icon: '🏠', label: 'Dashboard', path: '/administrativo' },
        { icon: '📅', label: 'Agenda', path: '/administrativo/schedule' },
        { icon: '👥', label: 'Pacientes', path: '/administrativo/patients' },
        { icon: '💰', label: 'Facturación', path: '/administrativo/billing' }
      ],
      'USUARIO': [
        { icon: '🏠', label: 'Dashboard', path: '/usuario' },
        { icon: '📁', label: 'Mis Estudios', path: '/usuario/studies' },
        { icon: '📅', label: 'Citas', path: '/usuario/appointments' },
        { icon: '👤', label: 'Perfil', path: '/usuario/profile' }
      ]
    };

    return roleMenus[role || 'ADMIN'] || roleMenus['ADMIN'];
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  logout() {
    this.authService.logout();
  }
}
