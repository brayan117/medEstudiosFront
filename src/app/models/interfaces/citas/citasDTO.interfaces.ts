export interface citaDTO{

  paciente_id: number | string
  medico_solicitante_id: number,
  tipo_estudio_id: number,
  fecha_solicitud: Date | string,
  fecha_programada: Date | string,
  estado_id: number,
  prioridad: string,
  notas_procedimiento: string | null

}