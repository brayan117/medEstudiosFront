export interface auditoriaDTO {
    id: number;
    usuario_id: number;
    accion: string;
    tabla_afectada: string;
    registro_id: number;
    descripcion: string;
    fecha: string;
    ip: string;
    user_agent: string;
    username: string;
    rol: string;
}
