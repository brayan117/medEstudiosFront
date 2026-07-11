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
  searchDetalle = '';
  timeFilter = '';

  ngOnInit() {
    this.loadAuditorias();
  }

  loadAuditorias() {
    this.loading = true;
    this.error = null;
    
    this.auditoriaService.obtenerAuditorias().subscribe({
      next: (data) => {
        this.auditorias = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading auditorias:', err);
        this.error = 'Error al cargar auditorías';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadByTimeFilter(filtro: string) {
    this.loading = true;
    this.error = null;
    this.timeFilter = filtro;
    
    this.auditoriaService.obtenerAuditoriasPorFiltro(filtro).subscribe({
      next: (data) => {
        this.auditorias = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading auditorias by filter:', err);
        this.error = 'Error al cargar auditorías con filtro';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredAuditorias() {
    return this.auditorias.filter(audit => {
      const matchUsuario = !this.searchUsuario || audit.usuario.toLowerCase().includes(this.searchUsuario.toLowerCase());
      const matchAccion = !this.searchAccion || audit.accion.toLowerCase().includes(this.searchAccion.toLowerCase());
      const matchDetalle = !this.searchDetalle || audit.detalle.toLowerCase().includes(this.searchDetalle.toLowerCase());
      return matchUsuario && matchAccion && matchDetalle;
    });
  }

  selectAuditoria(audit: auditoriaDTO) {
    this.selectedAuditoria = audit;
  }

  generarReporte() {
    this.auditoriaService.generarReporte().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_auditoria_${new Date().toISOString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.successMessage = 'Reporte generado correctamente';
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error generando reporte:', err);
        this.error = 'Error al generar el reporte';
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }
}
