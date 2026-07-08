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
  menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'Usuarios', path: '/admin/users' },
    { icon: '📚', label: 'Estudios', path: '/admin/studies' },
    { icon: '📊', label: 'Reportes', path: '/admin/reports' },
    { icon: '⚙️', label: 'Configuración', path: '/admin/settings' }
  ];

  private router = inject(Router);
  private authService = inject(AuthService);

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  logout() {
    this.authService.logout();
  }
}
