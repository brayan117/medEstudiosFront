import { Component } from '@angular/core';
import { Layout } from '../../../shared/layout/layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Study {
  id: number;
  dateTime: string;
  patientName: string;
  studyType: string;
  studyName: string;
  status: 'waiting' | 'in_progress' | 'completed';
  patientAge: number;
  patientGender: string;
  priority: 'low' | 'medium' | 'high';
  technician: string;
  notes: string;
}

@Component({
  selector: 'app-medico',
  imports: [Layout, CommonModule, FormsModule],
  templateUrl: './medico.html',
  styleUrl: './medico.css',
})
export class Medico {
  // Stats
  waitingStudies = 15;
  inProgressStudies = 8;
  completedStudies = 120;
  completedThisMonth = 45;

  // Mock data
  studies: Study[] = [
    { 
      id: 1, 
      dateTime: '2024-07-08 09:30', 
      patientName: 'Juan Pérez', 
      studyType: 'Radiografía', 
      studyName: 'RX Tórax PA/Lateral',
      status: 'waiting',
      patientAge: 45,
      patientGender: 'Masculino',
      priority: 'medium',
      technician: 'Carlos López',
      notes: 'Paciente con antecedentes respiratorios'
    },
    { 
      id: 2, 
      dateTime: '2024-07-08 10:15', 
      patientName: 'María García', 
      studyType: 'Tomografía', 
      studyName: 'TC Craneo',
      status: 'in_progress',
      patientAge: 32,
      patientGender: 'Femenino',
      priority: 'high',
      technician: 'Ana Martínez',
      notes: 'Cefalea persistente'
    },
    { 
      id: 3, 
      dateTime: '2024-07-08 08:00', 
      patientName: 'Pedro Rodríguez', 
      studyType: 'Ultrasonido', 
      studyName: 'US Abdominal',
      status: 'completed',
      patientAge: 58,
      patientGender: 'Masculino',
      priority: 'low',
      technician: 'Laura Sánchez',
      notes: 'Control post-operatorio'
    },
    { 
      id: 4, 
      dateTime: '2024-07-07 16:45', 
      patientName: 'Carmen López', 
      studyType: 'Resonancia', 
      studyName: 'RM Columna Lumbar',
      status: 'completed',
      patientAge: 41,
      patientGender: 'Femenino',
      priority: 'medium',
      technician: 'Carlos López',
      notes: 'Lumbalgia crónica'
    },
    { 
      id: 5, 
      dateTime: '2024-07-08 11:00', 
      patientName: 'Roberto Díaz', 
      studyType: 'Radiografía', 
      studyName: 'RX Extremidad Inferior',
      status: 'waiting',
      patientAge: 28,
      patientGender: 'Masculino',
      priority: 'low',
      technician: 'Ana Martínez',
      notes: 'Traumatismo deportivo'
    },
  ];

  // Filters
  filterName = '';
  filterStatus = '';
  filterDate = '';
  filterStudyType = '';
  filterCompleted = '';

  selectedStudy: Study | null = null;

  get filteredStudies() {
    return this.studies.filter(study => {
      const matchName = study.patientName.toLowerCase().includes(this.filterName.toLowerCase());
      const matchStatus = !this.filterStatus || study.status === this.filterStatus;
      const matchType = !this.filterStudyType || study.studyType === this.filterStudyType;
      const matchCompleted = !this.filterCompleted || 
                           (this.filterCompleted === 'yes' && study.status === 'completed') ||
                           (this.filterCompleted === 'no' && study.status !== 'completed');
      return matchName && matchStatus && matchType && matchCompleted;
    });
  }

  selectStudy(study: Study) {
    this.selectedStudy = study;
  }

  readStudy(study: Study) {
    console.log('Leer estudio:', study);
  }

  getStatusLabel(status: string): string {
    const labels = {
      'waiting': 'Esperando',
      'in_progress': 'En Proceso',
      'completed': 'Completado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return labels[priority as keyof typeof labels] || priority;
  }
}
