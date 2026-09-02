import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Layout } from '../../../../shared/layout/layout';
import { DiagnosticoService } from '../../../../services/diagnostico/diagnostico.service';

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

interface DiagnosticoForm {
  hallazgos: string;
  impresionDiagnostica: string;
  conclusion: string;
  recomendaciones: string;
  medicoResponsable: string;
  fechaDiagnostico: string;
}

@Component({
  selector: 'app-diagnostico-estudio',
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './diagnostico-estudio.html',
  styleUrl: './diagnostico-estudio.css',
})
export class DiagnosticoEstudio implements OnInit {
  private router = inject(Router);
  private diagnosticoService = inject(DiagnosticoService);
  
  study: Study | null = null;
  
  diagnosticoForm: DiagnosticoForm = {
    hallazgos: '',
    impresionDiagnostica: '',
    conclusion: '',
    recomendaciones: '',
    medicoResponsable: '',
    fechaDiagnostico: ''
  };

  ngOnInit() {
    this.study = this.diagnosticoService.getStudy();
    if (!this.study) {
      this.goBack();
    }
    this.diagnosticoForm.fechaDiagnostico = this.getTodayDate();
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  goBack() {
    this.router.navigate(['/medico/lectura']);
  }

  submitDiagnostico() {
    console.log('Diagnóstico enviado:', {
      estudio: this.study,
      diagnostico: this.diagnosticoForm
    });
    this.goBack();
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
