export interface usuarioDTO{
    id: number;
    username: string;
    tipoUsuarioId: number;
    tipoUsuario: string;
    fechaCreacion: string;
    ultimoLogin: string;
    estado: boolean;
}