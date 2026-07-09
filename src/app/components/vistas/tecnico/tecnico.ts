import { Component } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: number;
  dateTime: string;
  patientName: string;
  studyType: string;
  status: 'assigned' | 'waiting' | 'completed';
  patientAge: number;
  patientGender: string;
  priority: 'low' | 'medium' | 'high';
  room: string;
  notes: string;
}

@Component({
  selector: 'app-tecnico',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './tecnico.html',
  styleUrl: './tecnico.css',
})
export class Tecnico {
  // Stats
  assignedStudies = 12;
  waitingStudies = 8;
  completedStudies = 45;

  // Mock data
  patients: Patient[] = [
    { 
      id: 1, 
      dateTime: '2024-01-15 09:00',
      patientName: 'Juan Pérez', 
      studyType: 'Radiografía',
      status: 'assigned',
      patientAge: 45,
      patientGender: 'Masculino',
      priority: 'medium',
      room: 'Sala 1',
      notes: 'Paciente con alergia al contraste'
    },
    { 
      id: 2, 
      dateTime: '2024-01-15 10:30',
      patientName: 'María García', 
      studyType: 'Tomografía',
      status: 'waiting',
      patientAge: 32,
      patientGender: 'Femenino',
      priority: 'high',
      room: 'Sala 2',
      notes: 'Paciente embarazada'
    },
    { 
      id: 3, 
      dateTime: '2024-01-15 11:00',
      patientName: 'Carlos López', 
      studyType: 'Ultrasonido',
      status: 'assigned',
      patientAge: 58,
      patientGender: 'Masculino',
      priority: 'low',
      room: 'Sala 3',
      notes: 'Paciente con diabetes'
    },
    { 
      id: 4, 
      dateTime: '2024-01-15 14:00',
      patientName: 'Ana Martínez', 
      studyType: 'Resonancia',
      status: 'waiting',
      patientAge: 28,
      patientGender: 'Femenino',
      priority: 'medium',
      room: 'Sala 1',
      notes: ''
    },
    { 
      id: 5, 
      dateTime: '2024-01-15 15:30',
      patientName: 'Pedro Sánchez', 
      studyType: 'Radiografía',
      status: 'completed',
      patientAge: 67,
      patientGender: 'Masculino',
      priority: 'low',
      room: 'Sala 2',
      notes: 'Paciente hipertenso'
    }
  ];

  // Filters
  filterName = '';
  filterStatus = '';
  filterStudyType = '';

  selectedPatient: Patient | null = null;

  get filteredPatients() {
    return this.patients.filter(patient => {
      const matchName = patient.patientName.toLowerCase().includes(this.filterName.toLowerCase());
      const matchStatus = !this.filterStatus || patient.status === this.filterStatus;
      const matchType = !this.filterStudyType || patient.studyType === this.filterStudyType;
      return matchName && matchStatus && matchType;
    });
  }

  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
  }

  prepareStudy(patient: Patient) {
    console.log('Preparar estudio:', patient);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'assigned': 'Asignado',
      'waiting': 'En Espera',
      'completed': 'Completado'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return labels[priority] || priority;
  }
}
