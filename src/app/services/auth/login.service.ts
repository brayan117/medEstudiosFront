import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/env";
import { LoginRequestDTO } from "../../models/interfaces/auth/LoginRequestDTO";
import { LoginResponseDTO } from "../../models/interfaces/auth/LoginResponseDTO";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl + '/auth/login';

  login(request: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiUrl, request);
  }
}
