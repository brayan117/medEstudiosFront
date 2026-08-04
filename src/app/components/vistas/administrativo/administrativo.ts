import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cita {
  hora: string;
  pacienteNombre: string;
  pacienteId: string;
  estudio: string;
  medicoNombre?: string;
  tecnicoNombre?: string;
  sala: string;
  estado: 'pendiente' | 'proceso' | 'finalizado' | 'sinasignar';
  prioridad: 'normal' | 'urgente' | 'stat';
}

interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
  disponible: boolean;
  estudiosHoy: number;
}

interface Tecnico {
  id: string;
  nombre: string;
  especialidad: string;
  disponible: boolean;
}

interface Paciente {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-administrativo',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './administrativo.html',
  styleUrl: './administrativo.css',
})
export class Administrativo implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  selectedDate = '';
  showModal = false;
  activeFilter = 'todos';

  agenda: Cita[] = [];
  filteredAgenda: Cita[] = [];

  medicos: Medico[] = [];
  tecnicos: Tecnico[] = [];
  pacientes: Paciente[] = [];

  tiposEstudio = [
    'RX Tórax PA/Lateral',
    'RX Abdomen Simple',
    'TC Cerebro sin contraste',
    'TC Tórax con contraste',
    'TC Abdomen y Pelvis',
    'RM Cerebro',
    'RM Columna Lumbar',
    'RM Rodilla',
    'USG Abdomen Completo',
    'USG Pélvico',
    'Mamografía Bilateral',
    'Densitometría Ósea'
  ];

  salas = [
    'Sala 1 - RX',
    'Sala 2 - RX',
    'Sala 3 - TC',
    'Sala 4 - RM',
    'Sala 5 - USG',
    'Sala 6 - Mamografía',
    'Sala 7 - Densitometría'
  ];

  form = {
    pacienteId: '',
    fecha: '',
    hora: '',
    estudio: '',
    sala: '',
    medicoId: '',
    tecnicoId: '',
    notas: '',
    prioridad: 'normal'
  };

  ngOnInit() {
    this.setTodayDate();
    this.loadMockData();
    this.loadAgenda();
  }

  setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    this.selectedDate = today;
    this.form.fecha = today;
  }

  loadMockData() {
    this.pacientes = [
      { id: 'PAC-001', nombre: 'Carlos Mendoza Rivera' },
      { id: 'PAC-002', nombre: 'María Elena Torres' },
      { id: 'PAC-003', nombre: 'Roberto García Luna' },
      { id: 'PAC-004', nombre: 'Ana Patricia Suárez' },
      { id: 'PAC-005', nombre: 'Jorge Luis Castillo' }
    ];

    this.medicos = [
      { id: 'MED-01', nombre: 'Dr. Ricardo Hernández', especialidad: 'Radiología General', disponible: true, estudiosHoy: 4 },
      { id: 'MED-02', nombre: 'Dra. Patricia Solís', especialidad: 'TC / RM', disponible: true, estudiosHoy: 3 },
      { id: 'MED-03', nombre: 'Dr. Andrés Montiel', especialidad: 'Neurorradiología', disponible: false, estudiosHoy: 5 },
      { id: 'MED-04', nombre: 'Dra. Laura Espinoza', especialidad: 'Mamografía / USG', disponible: true, estudiosHoy: 2 }
    ];

    this.tecnicos = [
      { id: 'TEC-01', nombre: 'Ing. Daniela Cruz', especialidad: 'TC / RM', disponible: true },
      { id: 'TEC-02', nombre: 'Tec. Oscar Medina', especialidad: 'RX General', disponible: true },
      { id: 'TEC-03', nombre: 'Tec. Valentina Ríos', especialidad: 'USG / Mamografía', disponible: false },
      { id: 'TEC-04', nombre: 'Ing. Luis Fernando Paz', especialidad: 'TC / RM', disponible: true }
    ];

    this.agenda = [
      { hora: '07:30', pacienteNombre: 'Carlos Mendoza Rivera', pacienteId: 'PAC-001', estudio: 'RX Tórax PA/Lateral', medicoNombre: 'Dr. Ricardo Hernández', tecnicoNombre: 'Tec. Oscar Medina', sala: 'Sala 1 - RX', estado: 'finalizado', prioridad: 'normal' },
      { hora: '08:00', pacienteNombre: 'María Elena Torres', pacienteId: 'PAC-002', estudio: 'USG Abdomen Completo', medicoNombre: 'Dra. Laura Espinoza', tecnicoNombre: 'Tec. Valentina Ríos', sala: 'Sala 5 - USG', estado: 'finalizado', prioridad: 'normal' },
      { hora: '08:30', pacienteNombre: 'Roberto García Luna', pacienteId: 'PAC-003', estudio: 'TC Cerebro sin contraste', medicoNombre: 'Dra. Patricia Solís', tecnicoNombre: 'Ing. Daniela Cruz', sala: 'Sala 3 - TC', estado: 'proceso', prioridad: 'urgente' },
      { hora: '09:00', pacienteNombre: 'Ana Patricia Suárez', pacienteId: 'PAC-004', estudio: 'Mamografía Bilateral', medicoNombre: 'Dra. Laura Espinoza', tecnicoNombre: 'Tec. Valentina Ríos', sala: 'Sala 6 - Mamografía', estado: 'pendiente', prioridad: 'normal' },
      { hora: '09:30', pacienteNombre: 'Jorge Luis Castillo', pacienteId: 'PAC-005', estudio: 'RM Columna Lumbar', medicoNombre: 'Dra. Patricia Solís', tecnicoNombre: 'Ing. Luis Fernando Paz', sala: 'Sala 4 - RM', estado: 'pendiente', prioridad: 'normal' },
      { hora: '10:00', pacienteNombre: 'Carlos Mendoza Rivera', pacienteId: 'PAC-001', estudio: 'TC Tórax con contraste', medicoNombre: 'Dr. Andrés Montiel', tecnicoNombre: 'Ing. Daniela Cruz', sala: 'Sala 3 - TC', estado: 'pendiente', prioridad: 'urgente' },
      { hora: '10:30', pacienteNombre: 'María Elena Torres', pacienteId: 'PAC-002', estudio: 'RX Abdomen Simple', medicoNombre: 'Dr. Ricardo Hernández', tecnicoNombre: 'Tec. Oscar Medina', sala: 'Sala 2 - RX', estado: 'proceso', prioridad: 'normal' }
    ];

    this.applyFilter();
  }

  loadAgenda() {
    // En producción, esto llamaría a un servicio
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeFilter === 'todos') {
      this.filteredAgenda = this.agenda;
    } else {
      this.filteredAgenda = this.agenda.filter(c => c.estado === this.activeFilter);
    }
    this.cdr.detectChanges();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  get totalCitas() {
    return this.agenda.length;
  }

  get pendientes() {
    return this.agenda.filter(c => c.estado === 'pendiente').length;
  }

  get enProceso() {
    return this.agenda.filter(c => c.estado === 'proceso').length;
  }

  get finalizados() {
    return this.agenda.filter(c => c.estado === 'finalizado').length;
  }

  get medicosDisponibles() {
    return this.medicos.filter(m => m.disponible);
  }

  get tecnicosDisponibles() {
    return this.tecnicos.filter(t => t.disponible);
  }

  get sinAsignar() {
    return this.agenda.filter(c => c.estado === 'sinasignar' || !c.medicoNombre || !c.tecnicoNombre);
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getEstadoBadgeClass(estado: string): string {
    const classes = {
      'pendiente': 'warning',
      'proceso': 'info',
      'finalizado': 'success',
      'sinasignar': 'danger'
    };
    return classes[estado as keyof typeof classes] || 'info';
  }

  getEstadoLabel(estado: string): string {
    const labels = {
      'pendiente': 'Pendiente',
      'proceso': 'En Proceso',
      'finalizado': 'Finalizado',
      'sinasignar': 'Sin Asignar'
    };
    return labels[estado as keyof typeof labels] || estado;
  }

  changeEstado(cita: Cita) {
    const estados: Array<'pendiente' | 'proceso' | 'finalizado'> = ['pendiente', 'proceso', 'finalizado'];
    const currentIndex = estados.indexOf(cita.estado as any);
    if (currentIndex >= 0 && currentIndex < estados.length - 1) {
      cita.estado = estados[currentIndex + 1];
      this.applyFilter();
      this.cdr.detectChanges();
    }
  }

  selectCita(cita: Cita) {
    console.log('Seleccionar cita:', cita);
  }

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
  }

  closeModalOutside(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  resetForm() {
    this.form = {
      pacienteId: '',
      fecha: this.selectedDate,
      hora: '',
      estudio: '',
      sala: '',
      medicoId: '',
      tecnicoId: '',
      notas: '',
      prioridad: 'normal'
    };
  }

  submitAgenda(event: Event) {
    event.preventDefault();

    const paciente = this.pacientes.find(p => p.id === this.form.pacienteId);
    const medico = this.medicos.find(m => m.id === this.form.medicoId);
    const tecnico = this.tecnicos.find(t => t.id === this.form.tecnicoId);

    const nuevaCita: Cita = {
      hora: this.form.hora,
      pacienteNombre: paciente?.nombre || '',
      pacienteId: this.form.pacienteId,
      estudio: this.form.estudio,
      medicoNombre: medico?.nombre,
      tecnicoNombre: tecnico?.nombre,
      sala: this.form.sala,
      estado: 'pendiente',
      prioridad: this.form.prioridad as any
    };

    this.agenda.push(nuevaCita);
    this.agenda.sort((a, b) => a.hora.localeCompare(b.hora));
    this.applyFilter();
    this.closeModal();
  }
}
