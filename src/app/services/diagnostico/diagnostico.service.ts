import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private studySubject = new BehaviorSubject<Study | null>(null);
  study$ = this.studySubject.asObservable();

  setStudy(study: Study) {
    this.studySubject.next(study);
  }

  getStudy(): Study | null {
    return this.studySubject.value;
  }

  clearStudy() {
    this.studySubject.next(null);
  }
}
