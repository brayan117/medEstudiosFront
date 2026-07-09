export interface crearUsuarioDTO {
   username: string;
   password_hash:string;
   fecha_creacion: Date;
   ultimo_login: Date;
   estado: boolean;
   tipoUsuarioId: number;
}