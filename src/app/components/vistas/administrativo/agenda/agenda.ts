import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { afiliadoService } from '../../../../services/afiliado/afiliado.service';
import { afiliadoDTO } from '../../../../models/interfaces/afiliado/afiliadoDTO.interface';
import { medicoService } from '../../../../services/medico/medico.service';
import { MedicoBusquedaDTO } from '../../../../models/interfaces/medico/medicoBusquedaDTO.interface';

interface AppointmentForm {
  pacienteId: string;
  pacienteNombre: string;
  estudio: string;
  sala: string;
  medicoId: string;
  medicoNombre: string;
  tecnicoId: string;
  tecnicoNombre: string;
  prioridad: 'normal' | 'urgente';
  notas: string;
}

interface Appointment {
  date: string;
  hour: string;
  pacienteId: string;
  pacienteNombre: string;
  estudio: string;
  sala: string;
  medicoId: string;
  medicoNombre: string;
  tecnicoId: string;
  tecnicoNombre: string;
  prioridad: 'normal' | 'urgente';
  notas: string;
}

interface Paciente {
  id: string;
  nombre: string;
}

interface Medico {
  id: string;
  nombre: string;
}

interface Tecnico {
  id: string;
  nombre: string;
}

interface DayInfo {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-agenda',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {
  private afiliadoService = inject(afiliadoService);
  private medicoService = inject(medicoService);
  private cdr = inject(ChangeDetectorRef);

  currentWeekStart: Date = new Date();
  weekDays: DayInfo[] = [];
  hours: string[] = [];
  appointments: Appointment[] = [];

  showModal = false;
  selectedSlotDate: Date = new Date();
  selectedSlotHour = '';
  selectedAppointment: Appointment | null = null;
  showDetailModal = false;
  documentoBusqueda = '';
  medicoBusqueda = '';
  tecnicoBusqueda = '';
  resultadosMedicos: MedicoBusquedaDTO[] = [];
  mostrarResultadosMedicos = false;

  appointmentForm: AppointmentForm = {
    pacienteId: '',
    pacienteNombre: '',
    estudio: '',
    sala: '',
    medicoId: '',
    medicoNombre: '',
    tecnicoId: '',
    tecnicoNombre: '',
    prioridad: 'normal',
    notas: ''
  };

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  tecnicos: Tecnico[] = [];

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

  ngOnInit() {
    this.initializeWeek();
    this.initializeHours();
    this.loadMockData();
  }

  initializeWeek() {
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const startOfWeek = this.getStartOfWeek(this.currentWeekStart);
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        name: dayNames[i],
        date: date
      });
    }
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  initializeHours() {
    this.hours = [];
    for (let i = 6; i <= 18; i++) {
      for (let j = 0; j < 60; j += 10) {
        const hour = i < 10 ? `0${i}:${j === 0 ? '00' : j}` : `${i}:${j === 0 ? '00' : j}`;
        this.hours.push(hour);
      }
    }
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
      { id: 'MED-01', nombre: 'Dr. Ricardo Hernández' },
      { id: 'MED-02', nombre: 'Dra. Patricia Solís' },
      { id: 'MED-03', nombre: 'Dr. Andrés Montiel' },
      { id: 'MED-04', nombre: 'Dra. Laura Espinoza' }
    ];

    this.tecnicos = [
      { id: 'TEC-01', nombre: 'Ing. Daniela Cruz' },
      { id: 'TEC-02', nombre: 'Tec. Oscar Medina' },
      { id: 'TEC-03', nombre: 'Tec. Valentina Ríos' },
      { id: 'TEC-04', nombre: 'Ing. Luis Fernando Paz' }
    ];

    // Mock appointments
    const today = new Date();
    this.appointments = [
      {
        date: this.formatDateKey(today),
        hour: '09:00',
        pacienteId: 'PAC-001',
        pacienteNombre: 'Carlos Mendoza Rivera',
        estudio: 'RX Tórax PA/Lateral',
        sala: 'Sala 1 - RX',
        medicoId: 'MED-01',
        medicoNombre: 'Dr. Ricardo Hernández',
        tecnicoId: 'TEC-02',
        tecnicoNombre: 'Tec. Oscar Medina',
        prioridad: 'normal',
        notas: ''
      },
      {
        date: this.formatDateKey(today),
        hour: '10:30',
        pacienteId: 'PAC-002',
        pacienteNombre: 'María Elena Torres',
        estudio: 'TC Cerebro sin contraste',
        sala: 'Sala 3 - TC',
        medicoId: 'MED-02',
        medicoNombre: 'Dra. Patricia Solís',
        tecnicoId: 'TEC-01',
        tecnicoNombre: 'Ing. Daniela Cruz',
        prioridad: 'urgente',
        notas: 'Prioridad alta'
      }
    ];
  }

  formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }

  formatHour(hour: string): string {
    return hour;
  }

  getWeekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.formatDate(this.weekDays[0].date);
    const end = this.formatDate(this.weekDays[6].date);
    return `${start} - ${end}`;
  }

  previousWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.initializeWeek();
  }

  nextWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.initializeWeek();
  }

  hasAppointment(date: Date, hour: string): boolean {
    const dateKey = this.formatDateKey(date);
    return this.appointments.some(app => app.date === dateKey && app.hour === hour);
  }

  isAppointmentUrgent(date: Date, hour: string): boolean {
    const dateKey = this.formatDateKey(date);
    const appointment = this.appointments.find(app => app.date === dateKey && app.hour === hour);
    return appointment?.prioridad === 'urgente';
  }

  getAppointmentPatient(date: Date, hour: string): string {
    const dateKey = this.formatDateKey(date);
    const appointment = this.appointments.find(app => app.date === dateKey && app.hour === hour);
    return appointment?.pacienteNombre || '';
  }

  getAppointmentStudy(date: Date, hour: string): string {
    const dateKey = this.formatDateKey(date);
    const appointment = this.appointments.find(app => app.date === dateKey && app.hour === hour);
    return appointment?.estudio || '';
  }

  openSlotModal(date: Date, hour: string) {
    this.selectedSlotDate = date;
    this.selectedSlotHour = hour;
    
    if (this.hasAppointment(date, hour)) {
      // View existing appointment detail
      const dateKey = this.formatDateKey(date);
      this.selectedAppointment = this.appointments.find(app => app.date === dateKey && app.hour === hour) || null;
      this.showDetailModal = true;
    } else {
      // Open new appointment modal
      this.resetForm();
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedAppointment = null;
  }

  closeModalOutside(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeDetailModalOutside(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeDetailModal();
    }
  }

  resetForm() {
    this.appointmentForm = {
      pacienteId: '',
      pacienteNombre: '',
      estudio: '',
      sala: '',
      medicoId: '',
      medicoNombre: '',
      tecnicoId: '',
      tecnicoNombre: '',
      prioridad: 'normal',
      notas: ''
    };
    this.documentoBusqueda = '';
    this.medicoBusqueda = '';
    this.tecnicoBusqueda = '';
    this.resultadosMedicos = [];
    this.mostrarResultadosMedicos = false;
  }

  buscarPaciente() {
    if (!this.documentoBusqueda || this.documentoBusqueda.trim() === '') {
      return;
    }

    this.afiliadoService.buscarAfiliado(this.documentoBusqueda).subscribe({
      next: (afiliado: afiliadoDTO) => {
        this.appointmentForm.pacienteId = afiliado.documento;
        this.appointmentForm.pacienteNombre = `${afiliado.nom1} ${afiliado.nom2} ${afiliado.ape1} ${afiliado.ape2}`.trim();
      },
      error: (err) => {
        console.error('Error buscando afiliado:', err);
        alert('No se encontró el paciente con el documento ingresado');
      }
    });
  }

  buscarMedico() {
    if (!this.medicoBusqueda || this.medicoBusqueda.trim() === '') {
      return;
    }

    this.medicoService.buscarMedico(this.medicoBusqueda).subscribe({
      next: (medicos: MedicoBusquedaDTO[]) => {
        if (medicos.length === 0) {
          alert('No se encontró médico con ese nombre');
          this.mostrarResultadosMedicos = false;
        } else {
          this.resultadosMedicos = medicos;
          this.mostrarResultadosMedicos = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error buscando médico:', err);
        alert('Error al buscar médico');
        this.mostrarResultadosMedicos = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarMedico(medico: MedicoBusquedaDTO) {
    this.appointmentForm.medicoId = medico.id.toString();
    this.appointmentForm.medicoNombre = medico.nombres;
    this.medicoBusqueda = medico.nombres;
    this.mostrarResultadosMedicos = false;
  }

  buscarTecnico() {
    if (!this.tecnicoBusqueda || this.tecnicoBusqueda.trim() === '') {
      return;
    }

    // Buscar técnico en la lista mock por nombre (simulación)
    const tecnicoEncontrado = this.tecnicos.find(t => 
      t.nombre.toLowerCase().includes(this.tecnicoBusqueda.toLowerCase())
    );

    if (tecnicoEncontrado) {
      this.appointmentForm.tecnicoId = tecnicoEncontrado.id;
      this.appointmentForm.tecnicoNombre = tecnicoEncontrado.nombre;
    } else {
      alert('No se encontró técnico con ese nombre');
    }
  }

  submitAppointment(event: Event) {
    event.preventDefault();

    const newAppointment: Appointment = {
      date: this.formatDateKey(this.selectedSlotDate),
      hour: this.selectedSlotHour,
      pacienteId: this.appointmentForm.pacienteId,
      pacienteNombre: this.appointmentForm.pacienteNombre,
      estudio: this.appointmentForm.estudio,
      sala: this.appointmentForm.sala,
      medicoId: this.appointmentForm.medicoId,
      medicoNombre: this.appointmentForm.medicoNombre,
      tecnicoId: this.appointmentForm.tecnicoId,
      tecnicoNombre: this.appointmentForm.tecnicoNombre,
      prioridad: this.appointmentForm.prioridad as 'normal' | 'urgente',
      notas: this.appointmentForm.notas
    };

    this.appointments.push(newAppointment);
    this.closeModal();
  }

  editAppointment() {
    if (!this.selectedAppointment) return;

    this.closeDetailModal();
    
    // Pre-fill form with existing appointment data
    this.appointmentForm = {
      pacienteId: this.selectedAppointment.pacienteId,
      pacienteNombre: this.selectedAppointment.pacienteNombre,
      estudio: this.selectedAppointment.estudio,
      sala: this.selectedAppointment.sala,
      medicoId: this.selectedAppointment.medicoId,
      medicoNombre: this.selectedAppointment.medicoNombre,
      tecnicoId: this.selectedAppointment.tecnicoId,
      tecnicoNombre: this.selectedAppointment.tecnicoNombre,
      prioridad: this.selectedAppointment.prioridad,
      notas: this.selectedAppointment.notas
    };
    
    this.showModal = true;
  }

  deleteAppointment() {
    if (!this.selectedAppointment) return;

    const dateKey = this.formatDateKey(this.selectedSlotDate);
    this.appointments = this.appointments.filter(
      app => !(app.date === dateKey && app.hour === this.selectedSlotHour)
    );
    
    this.closeDetailModal();
  }
}
