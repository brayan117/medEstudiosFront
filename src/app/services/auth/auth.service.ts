import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginResponseDTO } from '../../models/auth/LoginResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'auth_username';
  private readonly ROLE_KEY = 'auth_role';
  private readonly ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private _authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this._authState.asObservable();

  constructor(private router: Router) {}

  login(response: LoginResponseDTO): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USERNAME_KEY, response.username);
    const role = this.decodeRoleFromToken(response.token);
    if (role) {
      localStorage.setItem(this.ROLE_KEY, role);
    }
    this._authState.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this._authState.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private decodeRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded[this.ROLE_CLAIM] || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getRouteByRole(): string {
    const role = this.getRole();
    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/admin',
      'MEDICO': '/medico',
      'USUARIO': '/usuario',
      'TECNICO': '/tecnico',
      'ADMINISTRATIVO': '/administrativo'
    };
    return roleRoutes[role || ''] || '/admin';
  }
}
