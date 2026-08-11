import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";
import { procedimientoBusquedaRequestDTO } from "../../models/interfaces/procedimiento/procedimientoBusquedaRequestDTO";
import { procedimientoBusquedaResponseDTO } from "../../models/interfaces/procedimiento/procedimientoBusquedaResponseDTO";

@Injectable({
  providedIn: 'root'
})
export class procedimientoService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "/salus/procedimientos"

    buscarProcedimiento(procedimiento: procedimientoBusquedaRequestDTO): Observable<procedimientoBusquedaResponseDTO[]> {
        return this.http.post<procedimientoBusquedaResponseDTO[]>(`${this.apiUrl}/buscar`, procedimiento);
    }

}