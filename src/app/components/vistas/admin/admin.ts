import { Component } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  // Mock data
  totalUsers = 150;
  activeUsers = 120;
  inactiveUsers = 30;

  users: User[] = [
    { id: 1, username: 'admin', email: 'admin@medestudios.com', role: 'ADMIN', isActive: true, createdAt: '2024-01-15' },
    { id: 2, username: 'medico1', email: 'medico1@medestudios.com', role: 'MEDICO', isActive: true, createdAt: '2024-02-20' },
    { id: 3, username: 'tecnico1', email: 'tecnico1@medestudios.com', role: 'TECNICO', isActive: true, createdAt: '2024-03-10' },
    { id: 4, username: 'usuario1', email: 'usuario1@gmail.com', role: 'USUARIO', isActive: false, createdAt: '2024-04-05' },
    { id: 5, username: 'administrativo1', email: 'admin1@medestudios.com', role: 'ADMINISTRATIVO', isActive: true, createdAt: '2024-05-12' },
  ];

  // Filters
  filterName = '';
  filterRole = '';
  filterStatus = '';

  get filteredUsers() {
    return this.users.filter(user => {
      const matchName = user.username.toLowerCase().includes(this.filterName.toLowerCase()) ||
                       user.email.toLowerCase().includes(this.filterName.toLowerCase());
      const matchRole = !this.filterRole || user.role === this.filterRole;
      const matchStatus = !this.filterStatus || 
                        (this.filterStatus === 'active' && user.isActive) ||
                        (this.filterStatus === 'inactive' && !user.isActive);
      return matchName && matchRole && matchStatus;
    });
  }

  addUser() {
    console.log('Agregar usuario');
  }

  editUser(user: User) {
    console.log('Editar usuario:', user);
  }

  deleteUser(user: User) {
    console.log('Eliminar usuario:', user);
  }

  toggleUserStatus(user: User) {
    console.log('Cambiar estado usuario:', user);
  }
}
