export interface EvolutionItem {
  id_avaliacao: string;
  criado_em: string;
  inicio: string;
  localizacao: string;
  duracao: string;
  caracteristica: string;
  fatores: string;
  irradiacao: string;
  padrao_temporal: string;
  sintomas_associados: string;
}

export interface EvolutionFilters {
  startDate?: Date;
  endDate?: Date;
  caracteristicas?: string[];
  localizacoes?: string[];
}

export interface EvolutionResponse {
  data: EvolutionItem[];
  total: number;
  page: number;
  limit: number;
}
