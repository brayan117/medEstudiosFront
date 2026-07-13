import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auditoriaDTO } from '../../../models/interfaces/auditoria/auditoriaDTO.interface';
import { auditoriaService } from '../../../services/auditoria/auditoria.service';
import { paginadoResponseDTO } from '../../../models/interfaces/paginado/paginadoResponseDTO.interface';

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  // Filters
  searchUsuario = '';
  searchAccion = '';
  searchDescripcion = '';
  searchTabla = '';
  fechaInicio = '';
  fechaFin = '';
  sortCampo = 'fecha';
  sortDireccion: 'asc' | 'desc' = 'desc';

  // Always sort by fecha desc
  readonly DEFAULT_SORT_CAMPO = 'fecha';
  readonly DEFAULT_SORT_DIRECCION: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.loadAuditorias();
  }

  loadAuditorias() {
    this.loading = true;
    this.error = null;
    
    const params: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchAccion) {
      params.accion = this.searchAccion;
    }

    if (this.searchTabla) {
      params.tablaAfectada = this.searchTabla;
    }

    if (this.fechaInicio) {
      params.fechaInicio = this.fechaInicio;
    }

    if (this.fechaFin) {
      params.fechaFin = this.fechaFin;
    }

    // Always sort by fecha desc (most recent first)
    params['sort[campo]'] = this.DEFAULT_SORT_CAMPO;
    params['sort[direccion]'] = this.DEFAULT_SORT_DIRECCION;

    this.auditoriaService.obtenerAuditoriasPaginado(params).subscribe({
      next: (response: paginadoResponseDTO) => {
        this.auditorias = response.data as auditoriaDTO[];
        this.totalRecords = response.totalCount;
        this.totalPages = response.totalPages;
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
      const matchDescripcion = !this.searchDescripcion || audit.descripcion.toLowerCase().includes(this.searchDescripcion.toLowerCase());
      return matchUsuario && matchDescripcion;
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAuditorias();
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadAuditorias();
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadAuditorias();
  }

  clearFilters() {
    this.searchUsuario = '';
    this.searchAccion = '';
    this.searchDescripcion = '';
    this.searchTabla = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.currentPage = 1;
    this.loadAuditorias();
  }

  toggleSort(campo: string) {
    if (this.sortCampo === campo) {
      this.sortDireccion = this.sortDireccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCampo = campo;
      this.sortDireccion = 'desc';
    }
    this.loadAuditorias();
  }

  selectAuditoria(audit: auditoriaDTO) {
    this.selectedAuditoria = audit;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }

  getShowingRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);
    return `${start} - ${end}`;
  }
}
