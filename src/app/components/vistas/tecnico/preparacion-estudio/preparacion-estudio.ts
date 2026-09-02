import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Layout } from '../../../../shared/layout/layout';
import { PreparacionService } from '../../../../services/preparacion/preparacion.service';

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

interface PreparacionForm {
  pacientePreparado: boolean;
  contrasteAdministrado: boolean;
  tipoContraste: string;
  dosisContraste: string;
  ayunoCumplido: boolean;
  alergiasConocidas: string;
  medicamentosActuales: string;
  antecedentesMedicos: string;
  pesoPaciente: number;
  alturaPaciente: number;
  notasPreparacion: string;
  tecnicoResponsable: string;
}

@Component({
  selector: 'app-preparacion-estudio',
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './preparacion-estudio.html',
  styleUrl: './preparacion-estudio.css',
})
export class PreparacionEstudio implements OnInit {
  private router = inject(Router);
  private preparacionService = inject(PreparacionService);
  
  patient: Patient | null = null;
  
  preparacionForm: PreparacionForm = {
    pacientePreparado: false,
    contrasteAdministrado: false,
    tipoContraste: '',
    dosisContraste: '',
    ayunoCumplido: false,
    alergiasConocidas: '',
    medicamentosActuales: '',
    antecedentesMedicos: '',
    pesoPaciente: 0,
    alturaPaciente: 0,
    notasPreparacion: '',
    tecnicoResponsable: ''
  };

  ngOnInit() {
    // Obtener datos del paciente del servicio
    this.patient = this.preparacionService.getPatient();
    if (!this.patient) {
      // Si no hay datos, redirigir de vuelta
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/tecnico']);
  }

  submitPreparacion() {
    console.log('Preparación enviada:', {
      paciente: this.patient,
      preparacion: this.preparacionForm
    });
    this.goBack();
  }

  getStudyTypeLabel(studyType: string): string {
    const labels: { [key: string]: string } = {
      'Radiografía': 'RX',
      'Tomografía': 'TC',
      'Ultrasonido': 'USG',
      'Resonancia': 'RM'
    };
    return labels[studyType] || studyType;
  }
}
