import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { usuarioDTO } from '../../../models/interfaces/usuario/usuarioDTO.interface';
import { usuarioService } from '../../../services/usuario/usuario.service';
import { requestActualizarEstadoDTO } from '../../../models/interfaces/usuario/requestActualizarEstadoDTO.interface';
@Component({
  selector: 'app-admin',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private usuarioService = inject(usuarioService);
  private cdr = inject(ChangeDetectorRef);

  users: usuarioDTO[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Stats
  get totalUsers() {
    return this.users.length;
  }

  get activeUsers() {
    return this.users.filter(u => u.estado).length;
  }

  get inactiveUsers() {
    return this.users.filter(u => !u.estado).length;
  }

  // Filters
  filterName = '';
  filterRole = '';
  filterStatus = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    console.log('Iniciando carga de usuarios...');
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.users = data;
        this.loading = false;
        console.log('Loading establecido en false, usuarios:', this.users.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers() {
    return this.users.filter(user => {
      const matchName = user.username.toLowerCase().includes(this.filterName.toLowerCase());
      const matchRole = !this.filterRole || user.tipoUsuario === this.filterRole;
      const matchStatus = !this.filterStatus || 
                        (this.filterStatus === 'active' && user.estado) ||
                        (this.filterStatus === 'inactive' && !user.estado);
      return matchName && matchRole && matchStatus;
    });
  }

  addUser() {
    console.log('Agregar usuario');
  }

  editUser(user: usuarioDTO) {
    console.log('Editar usuario:', user);
  }

  deleteUser(user: usuarioDTO) {
    console.log('Eliminar usuario:', user);
  }

  toggleUserStatus(user: usuarioDTO) {
    this.actualizarEstadoUsuario(user);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  actualizarEstadoUsuario(user: usuarioDTO) {
    const nuevoEstado = !user.estado;
    const dto: requestActualizarEstadoDTO = {
      estado: nuevoEstado
    };
    
    this.usuarioService.actualizarEstadoUsuario(user.id, dto).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
        this.successMessage = `Estado de ${user.username} actualizado a ${nuevoEstado ? 'activo' : 'inactivo'} correctamente`;
        this.error = null;
        this.loadUsers();
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        this.error = 'Error al actualizar el estado del usuario';
        this.successMessage = null;
        this.cdr.detectChanges();
      }
    });
  }

 
}


