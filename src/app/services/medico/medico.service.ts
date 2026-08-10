import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";
import { MedicoBusquedaDTO } from "../../models/interfaces/medico/medicoBusquedaDTO.interface";

@Injectable({
  providedIn: 'root'
})
export class medicoService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "/salus/medicos"

    buscarMedico(nombre: string): Observable<MedicoBusquedaDTO[]> {
        return this.http.get<MedicoBusquedaDTO[]>(`${this.apiUrl}/nombre/${nombre}`);
    }

}