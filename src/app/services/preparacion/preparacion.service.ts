import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class PreparacionService {
  private patientSubject = new BehaviorSubject<Patient | null>(null);
  patient$ = this.patientSubject.asObservable();

  setPatient(patient: Patient) {
    this.patientSubject.next(patient);
  }

  getPatient(): Patient | null {
    return this.patientSubject.value;
  }

  clearPatient() {
    this.patientSubject.next(null);
  }
}
