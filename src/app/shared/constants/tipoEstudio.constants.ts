export const TIPO_ESTUDIO = {
  TOMOGRAFIA: 'Tomografia',
  RESONANCIA: 'Resonancia',
  RADIOGRAFIA: 'Radiografia',
  ECOGRAFIA: 'Ecografia'
} as const;

export type TipoEstudio = typeof TIPO_ESTUDIO[keyof typeof TIPO_ESTUDIO];
