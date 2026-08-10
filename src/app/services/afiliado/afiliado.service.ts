import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";
import { afiliadoDTO } from "../../models/interfaces/afiliado/afiliadoDTO.interface";

@Injectable({
  providedIn: 'root'
})
export class afiliadoService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "/salus/afiliados"

    buscarAfiliado(documento: string): Observable<afiliadoDTO> {
        return this.http.get<afiliadoDTO>(`${this.apiUrl}/documento/${documento}`);
    }

}
