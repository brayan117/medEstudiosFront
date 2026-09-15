import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../../shared/layout/layout';
import { DicomViewer } from '../../../components/dicom-viewer/dicom-viewer';

interface Study {
  id: number;
  dateTime: string;
  studyType: string;
  studyName: string;
  status: 'completed' | 'pending' | 'in_progress';
  doctor: string;
  result?: string;
}

interface ClinicalHistory {
  id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  notes: string;
}

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, Layout, DicomViewer],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class Usuario implements OnInit {
  studies: Study[] = [];
  clinicalHistory: ClinicalHistory[] = [];
  selectedStudy: Study | null = null;
  showDicomViewer = false;

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    // Datos de ejemplo de estudios
    this.studies = [
      {
        id: 1,
        dateTime: '2024-01-15 10:30',
        studyType: 'Radiografía',
        studyName: 'Radiografía de Tórax',
        status: 'completed',
        doctor: 'Dr. García',
        result: 'Normal'
      },
      {
        id: 2,
        dateTime: '2024-02-20 14:15',
        studyType: 'Tomografía',
        studyName: 'TC Craneal',
        status: 'completed',
        doctor: 'Dra. Martínez',
        result: 'Sin hallazgos patológicos'
      },
      {
        id: 3,
        dateTime: '2024-03-10 09:00',
        studyType: 'Ultrasonido',
        studyName: 'Ecografía Abdominal',
        status: 'in_progress',
        doctor: 'Dr. Rodríguez',
        result: undefined
      }
    ];

    // Datos de ejemplo de historia clínica
    this.clinicalHistory = [
      {
        id: 1,
        date: '2024-01-15',
        diagnosis: 'Dolor torácico agudo',
        treatment: 'Reposo y analgésicos',
        doctor: 'Dr. García',
        notes: 'Paciente refiere dolor en hemitórax derecho'
      },
      {
        id: 2,
        date: '2024-02-20',
        diagnosis: 'Cefalea tensional',
        treatment: 'Relajantes musculares',
        doctor: 'Dra. Martínez',
        notes: 'Estudio neurológico normal'
      }
    ];
  }

  viewStudyDetails(study: Study) {
    this.selectedStudy = study;
    this.showDicomViewer = true;
  }

  closeDicomViewer() {
    this.showDicomViewer = false;
    this.selectedStudy = null;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'in_progress': 'En Proceso'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'in_progress': 'status-in-progress'
    };
    return classes[status] || '';
  }

  getStudyTypeLabel(studyType: string): string {
    const labels: { [key: string]: string } = {
      'Radiografía': 'RX',
      'Tomografía': 'TC',
      'Ultrasonido': 'US',
      'Resonancia': 'RM'
    };
    return labels[studyType] || studyType;
  }
}
