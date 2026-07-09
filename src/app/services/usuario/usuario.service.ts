import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { Observable } from "rxjs";  
import { usuarioDTO } from "../../models/interfaces/usuario/usuarioDTO.interface";
import { responseActualizarEstadoDTO } from "../../models/interfaces/usuario/responseActualizarEstadoDTO.interface";
import { requestActualizarEstadoDTO } from "../../models/interfaces/usuario/requestActualizarEstadoDTO.interface";
import { crearUsuarioDTO } from "../../models/interfaces/usuario/crearUsuarioDTO.interface";
import { crearUsuarioResponseDTO } from "../../models/interfaces/usuario/crearUsuarioResponseDTO.interface";

@Injectable({
    providedIn: 'root'
})
export class usuarioService {

    private readonly apiUrl = environment.apiUrl + '/usuarios';
    constructor(private http: HttpClient) { }

    obtenerUsuarios(): Observable<usuarioDTO[]> {
        return this.http.get<usuarioDTO[]>(this.apiUrl);
    }

    actualizarEstadoUsuario(id:number, dto: requestActualizarEstadoDTO): Observable<responseActualizarEstadoDTO> {
        return this.http.put<responseActualizarEstadoDTO>(`${this.apiUrl}/${id}/estado`, dto);
    }
  
    crearUsuario(dto: crearUsuarioDTO): Observable<crearUsuarioResponseDTO> {
        return this.http.post<crearUsuarioResponseDTO>(this.apiUrl, dto);
    }
} 