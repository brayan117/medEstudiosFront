import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auditoriaDTO } from '../../../models/interfaces/auditoria/auditoriaDTO.interface';
import { auditoriaService } from '../../../services/auditoria/auditoria.service';

@Component({
  selector: 'app-auditoria',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class Auditoria implements OnInit {
  private auditoriaService = inject(auditoriaService);
  private cdr = inject(ChangeDetectorRef);

  auditorias: auditoriaDTO[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  selectedAuditoria: auditoriaDTO | null = null;

  // Filters
  searchUsuario = '';
  searchAccion = '';
  searchDescripcion = '';
  timeFilter = '';

  ngOnInit() {
    this.loadAuditorias();
  }

  loadAuditorias() {
    this.loading = true;
    this.error = null;
    
    this.auditoriaService.obtenerAuditorias().subscribe({
      next: (data: auditoriaDTO[]) => {
        this.auditorias = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading auditorias:', err);
        this.error = 'Error al cargar auditorías';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredAuditorias() {
    return this.auditorias.filter(audit => {
      const matchUsuario = !this.searchUsuario || audit.username.toLowerCase().includes(this.searchUsuario.toLowerCase());
      const matchAccion = !this.searchAccion || audit.accion.toLowerCase().includes(this.searchAccion.toLowerCase());
      const matchDescripcion = !this.searchDescripcion || audit.descripcion.toLowerCase().includes(this.searchDescripcion.toLowerCase());
      return matchUsuario && matchAccion && matchDescripcion;
    });
  }

  selectAuditoria(audit: auditoriaDTO) {
    this.selectedAuditoria = audit;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }
}
