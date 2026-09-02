import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Layout } from '../../../../shared/layout/layout';
import { LecturaService } from '../../../../services/lectura/lectura.service';
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

@Component({
  selector: 'app-lectura-estudio',
  imports: [CommonModule, Layout],
  templateUrl: './lectura-estudio.html',
  styleUrl: './lectura-estudio.css',
})
export class LecturaEstudio implements OnInit, OnDestroy {
  private router = inject(Router);
  private lecturaService = inject(LecturaService);
  private diagnosticoService = inject(DiagnosticoService);
  
  study: Study | null = null;
  isFullscreen = false;

  ngOnInit() {
    this.study = this.lecturaService.getStudy();
    if (!this.study) {
      this.goBack();
    }
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private onFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
  }

  goBack() {
    this.router.navigate(['/medico']);
  }

  toggleFullscreen() {
    const dicomViewer = document.querySelector('.dicom-viewer') as HTMLElement;
    if (dicomViewer) {
      if (!document.fullscreenElement) {
        dicomViewer.requestFullscreen().catch(err => {
          console.error('Error al entrar en pantalla completa:', err);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.error('Error al salir de pantalla completa:', err);
        });
      }
    }
  }

  goToDiagnostico() {
    if (this.study) {
      this.diagnosticoService.setStudy(this.study);
    }
    this.router.navigate(['/medico/diagnostico']);
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
