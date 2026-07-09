export interface crearUsuarioResponseDTO {
    id: number;
    username: string;
    fecha_creacion: Date;
    ultimo_login: Date;
    estado: boolean;
    tipoUsuario: string;
}