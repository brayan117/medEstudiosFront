import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";
import { citaDTO } from "../../models/interfaces/citas/citasDTO.interfaces";

@Injectable({
  providedIn: 'root'
})
export class citasService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "/citas"

    crearCita(cita: citaDTO): Observable<citaDTO> {
        return this.http.post<citaDTO>(`${this.apiUrl}`, cita);
    }

}