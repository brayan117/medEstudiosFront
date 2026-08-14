import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Layout } from '../../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { afiliadoService } from '../../../../services/afiliado/afiliado.service';
import { afiliadoDTO } from '../../../../models/interfaces/afiliado/afiliadoDTO.interface';
import { medicoService } from '../../../../services/medico/medico.service';
import { MedicoBusquedaDTO } from '../../../../models/interfaces/medico/medicoBusquedaDTO.interface';
import { procedimientoService } from '../../../../services/procedimiento/procedimiento.service';
import { procedimientoBusquedaRequestDTO } from '../../../../models/interfaces/procedimiento/procedimientoBusquedaRequestDTO';
import { procedimientoBusquedaResponseDTO } from '../../../../models/interfaces/procedimiento/procedimientoBusquedaResponseDTO';
import { TIPO_ESTUDIO } from '../../../../shared/constants/tipoEstudio.constants';
import { CITA_ESTADO } from '../../../../shared/constants/citaEstado.constants';
import { citasService } from '../../../../services/citas/citas.service';
import { citaDTO } from '../../../../models/interfaces/citas/citasDTO.interfaces';
import { citasResponseDTO } from '../../../../models/interfaces/citas/citasResponseDTO.interfaces';
import { finalize, timeout } from 'rxjs';

interface AppointmentForm {
  pacienteId: string;
  pacienteNombre: string;
  estudioId: number;
  estudio: string;
  medicoId: string;
  medicoNombre: string;
  prioridad: 'normal' | 'urgente';
  notas: string;
}

interface Appointment {
  idAgenda: number;
  idEstudio: number;
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
  private procedimientoService = inject(procedimientoService);
  private citasService = inject(citasService);
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
  tipoEstudioSeleccionado = '';
  resultadosMedicos: MedicoBusquedaDTO[] = [];
  mostrarResultadosMedicos = false;
  resultadosProcedimientos: procedimientoBusquedaResponseDTO[] = [];
  mostrarResultadosProcedimientos = false;
  formularioValido = false;
  agendandoCita = false;
  eliminandoCita = false;

  appointmentForm: AppointmentForm = {
    pacienteId: '',
    pacienteNombre: '',
    estudioId: 0,
    estudio: '',
    medicoId: '',
    medicoNombre: '',
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
    this.generateWeekDays();
    this.initializeHours();
    this.loadCitas();
  }

  loadCitas() {
    // Calcular rango de la semana actual (lunes a domingo)
    const startOfWeek = new Date(this.currentWeekStart);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    const monday = new Date(startOfWeek.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const fechaInicio = this.formatDateTimeLocal(monday);
    const fechaFin = this.formatDateTimeLocal(sunday);

    console.log('Cargando citas desde:', fechaInicio, 'hasta:', fechaFin);

    this.citasService.getCitas(fechaInicio, fechaFin).subscribe({
      next: (citas) => {
        console.log('Citas recibidas:', citas);
        this.mapCitasToAppointments(citas);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
      }
    });
  }

  mapCitasToAppointments(citas: citasResponseDTO[]) {
    this.appointments = citas.map(cita => {
      const fecha = new Date(cita.fecha_programada);
      const dateKey = this.formatDateKey(fecha);
      const hour = fecha.toTimeString().slice(0, 5); // HH:MM

      return {
        idAgenda: cita.id_agenda,
        idEstudio: cita.id_estudio,
        date: dateKey,
        hour: hour,
        pacienteId: '',
        pacienteNombre: cita.nombre_paciente,
        estudio: cita.nombre_estudio,
        sala: '',
        medicoId: '',
        medicoNombre: cita.nombre_medico,
        tecnicoId: '',
        tecnicoNombre: '',
        prioridad: cita.prioridad.toLowerCase() as 'normal' | 'urgente',
        notas: cita.notas_procedimiento
      };
    });
  }

  generateWeekDays() {
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
    for (let i = 6; i <= 22; i++) {
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
        idAgenda: 1,
        idEstudio: 1,
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
        idAgenda: 2,
        idEstudio: 2,
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
    const year = date.getFullYear();
    const month = this.pad(date.getMonth() + 1);
    const day = this.pad(date.getDate());
    return `${year}-${month}-${day}`;
  }

  formatDateTimeLocal(date: Date): string {
    return `${this.formatDateKey(date)}T${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
  }

  pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }

  formatHour(hour: string): string {
    if (!hour) return '';
    const [hours, minutes] = hour.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return hour;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours12}:${this.pad(minutes)} ${period}`;
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
    this.generateWeekDays();
    this.loadCitas();
  }

  nextWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeekDays();
    this.loadCitas();
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);
    
    if (this.hasAppointment(date, hour)) {
      // View existing appointment detail
      const dateKey = this.formatDateKey(date);
      this.selectedAppointment = this.appointments.find(app => app.date === dateKey && app.hour === hour) || null;
      this.showDetailModal = true;
    } else {
      // Check if date is in the past
      if (slotDate < today) {
        alert('No se pueden agendar citas en fechas anteriores a hoy');
        return;
      }
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
      estudioId: 0,
      estudio: '',
      medicoId: '',
      medicoNombre: '',
      prioridad: 'normal',
      notas: ''
    };
    this.documentoBusqueda = '';
    this.medicoBusqueda = '';
    this.tecnicoBusqueda = '';
    this.tipoEstudioSeleccionado = '';
    this.resultadosMedicos = [];
    this.mostrarResultadosMedicos = false;
    this.resultadosProcedimientos = [];
    this.mostrarResultadosProcedimientos = false;
    this.formularioValido = false;
  }

  buscarPaciente() {
    if (!this.documentoBusqueda || this.documentoBusqueda.trim() === '') {
      return;
    }

    this.afiliadoService.buscarAfiliado(this.documentoBusqueda).subscribe({
      next: (afiliado: afiliadoDTO) => {
        this.appointmentForm.pacienteId = afiliado.documento;
        this.appointmentForm.pacienteNombre = `${afiliado.nom1} ${afiliado.nom2} ${afiliado.ape1} ${afiliado.ape2}`.trim();
        this.validarFormulario();
        this.cdr.detectChanges();
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

  seleccionarPaciente() {
    this.validarFormulario();
  }

  seleccionarMedico(medico: MedicoBusquedaDTO) {
    this.appointmentForm.medicoId = medico.id.toString();
    this.appointmentForm.medicoNombre = medico.nombres;
    this.medicoBusqueda = medico.nombres;
    this.mostrarResultadosMedicos = false;
    this.validarFormulario();
  }

  buscarProcedimientos() {
    if (!this.tipoEstudioSeleccionado) {
      return;
    }

    const request: procedimientoBusquedaRequestDTO = {
      nombre: null,
      tipo: this.tipoEstudioSeleccionado
    };

    console.log('Buscando procedimientos con request:', request);

    this.procedimientoService.buscarProcedimiento(request).subscribe({
      next: (procedimientos: procedimientoBusquedaResponseDTO[]) => {
        console.log('Procedimientos recibidos:', procedimientos);
        if (procedimientos.length === 0) {
          alert('No se encontraron procedimientos para este tipo');
          this.mostrarResultadosProcedimientos = false;
        } else {
          this.resultadosProcedimientos = procedimientos;
          this.mostrarResultadosProcedimientos = true;
          console.log('Mostrando resultados:', this.mostrarResultadosProcedimientos);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error buscando procedimientos:', err);
        alert('Error al buscar procedimientos');
        this.mostrarResultadosProcedimientos = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarProcedimiento(procedimiento: procedimientoBusquedaResponseDTO) {
    this.appointmentForm.estudioId = procedimiento.id_codigo;
    this.appointmentForm.estudio = procedimiento.nom_procedimiento;
    this.mostrarResultadosProcedimientos = false;
    this.validarFormulario();
  }

  validarFormulario() {
    this.formularioValido = !!(
      this.appointmentForm.pacienteId &&
      this.appointmentForm.estudioId !== 0 &&
      this.appointmentForm.medicoId &&
      this.appointmentForm.prioridad
    );
  }

  submitAppointment(event: Event) {
    event.preventDefault();

    if (this.agendandoCita) {
      return;
    }

    this.agendandoCita = true;

    // Crear fecha programada combinando la fecha seleccionada con la hora
    const fechaProgramada = new Date(this.selectedSlotDate);
    const [hours, minutes] = this.selectedSlotHour.split(':');
    fechaProgramada.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Fecha de solicitud es la fecha actual
    const fechaSolicitud = new Date();

    const cita: citaDTO = {
      paciente_id: parseInt(this.appointmentForm.pacienteId),
      medico_solicitante_id: parseInt(this.appointmentForm.medicoId),
      tipo_estudio_id: this.appointmentForm.estudioId,
      fecha_solicitud: this.formatDateTimeLocal(fechaSolicitud),
      fecha_programada: this.formatDateTimeLocal(fechaProgramada),
      estado_id: CITA_ESTADO.AGENDADO,
      prioridad: this.appointmentForm.prioridad.toUpperCase(),
      notas_procedimiento: this.appointmentForm.notas || ''
    };

    this.citasService.crearCita(cita)
      .pipe(
        timeout(30000),
        finalize(() => {
          this.agendandoCita = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Cita creada exitosamente:', res);

          this.closeModal();
          this.cdr.detectChanges();

          this.loadCitas();
        },
        error: (err) => {
          console.error('Error creando cita:', err);
          alert('Error al agendar la cita. Por favor intente nuevamente.');
        }
      });
  }

  editAppointment() {
    if (!this.selectedAppointment) return;

    // Check if appointment date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(this.selectedSlotDate);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      alert('No se pueden editar citas en fechas anteriores a hoy');
      return;
    }

    this.closeDetailModal();
    
    // Pre-fill form with existing appointment data
    this.appointmentForm = {
      pacienteId: this.selectedAppointment.pacienteId,
      pacienteNombre: this.selectedAppointment.pacienteNombre,
      estudioId: 0,
      estudio: this.selectedAppointment.estudio,
      medicoId: this.selectedAppointment.medicoId,
      medicoNombre: this.selectedAppointment.medicoNombre,
      prioridad: this.selectedAppointment.prioridad,
      notas: this.selectedAppointment.notas
    };
    
    this.showModal = true;
  }

  deleteAppointment() {
    if (!this.selectedAppointment) return;
    if (this.eliminandoCita) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(this.selectedSlotDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      alert('No se pueden eliminar citas en fechas anteriores a hoy');
      return;
    }

    const idAgenda = this.selectedAppointment.idAgenda;
    const idEstudio = this.selectedAppointment.idEstudio;

    if (!idAgenda || !idEstudio) {
      alert('No se encontraron los datos de la cita para eliminar. Intente recargar la agenda.');
      return;
    }

    this.eliminandoCita = true;

    this.citasService.deleteCita(idAgenda, idEstudio)
      .pipe(
        timeout(30000),
        finalize(() => {
          this.eliminandoCita = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          console.log('Cita eliminada exitosamente:', idAgenda, idEstudio);
          this.closeDetailModal();
          this.loadCitas();
        },
        error: (err) => {
          console.error('Error eliminando cita:', err);
          alert('Error al eliminar la cita. Por favor intente nuevamente.');
        }
      });
  }
}
