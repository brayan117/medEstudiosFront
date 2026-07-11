import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";  
import { auditoriaDTO } from "../../models/interfaces/auditoria/auditoriaDTO.interface";

@Injectable({
    providedIn: 'root'
})
export class auditoriaService {

    private readonly apiUrl = environment.apiUrl + '/auditoria';
    constructor(private http: HttpClient) { }

    obtenerAuditorias(): Observable<auditoriaDTO[]> {
        return this.http.get<auditoriaDTO[]>(this.apiUrl);
    }

    obtenerAuditoriasPorFiltro(filtro: string): Observable<auditoriaDTO[]> {
        return this.http.get<auditoriaDTO[]>(`${this.apiUrl}/filtro/${filtro}`);
    }

    generarReporte(): Observable<any> {
        return this.http.get(`${this.apiUrl}/reporte`, { responseType: 'blob' });
    }
}
