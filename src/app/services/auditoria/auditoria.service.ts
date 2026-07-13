import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";  
import { auditoriaDTO } from "../../models/interfaces/auditoria/auditoriaDTO.interface";
import { paginadoResponseDTO } from "../../models/interfaces/paginado/paginadoResponseDTO.interface";

@Injectable({
    providedIn: 'root'
})
export class auditoriaService {

    private readonly apiUrl = environment.apiUrl + '/auditorias';
    constructor(private http: HttpClient) { }

    obtenerAuditorias(): Observable<auditoriaDTO[]> {
        return this.http.get<auditoriaDTO[]>(this.apiUrl);
    }

    obtenerAuditoriasPaginado(params: any): Observable<paginadoResponseDTO> {
        return this.http.get<paginadoResponseDTO>(`${this.apiUrl}/paginado`, { params });
    }
}
