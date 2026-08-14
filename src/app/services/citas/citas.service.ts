import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";
import { citaDTO } from "../../models/interfaces/citas/citasDTO.interfaces";
import { citasResponseDTO } from "../../models/interfaces/citas/citasResponseDTO.interfaces";

@Injectable({
  providedIn: 'root'
})
export class citasService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "/citas"

    crearCita(cita: citaDTO): Observable<citaDTO> {
        return this.http.post<citaDTO>(`${this.apiUrl}`, cita);
    }

    getCitas(fechaInicio: string, fechaFin: string): Observable<citasResponseDTO[]> {
        return this.http.get<citasResponseDTO[]>(`${this.apiUrl}`, {
            params: {
                fechaInicio: fechaInicio,
                fechaFin: fechaFin
            }
        });
    }

    deleteCita(idAgenda: number, idEstudio: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${idAgenda}/estudio/${idEstudio}`);
    }

}