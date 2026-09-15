export interface Profissao {
  id: string;
  nome: string;
  conselho_padrao: string | null;
  ordem: number;
}

export interface Conselho {
  id: string;
  sigla: string;
  nome: string;
  validacao_automatica: boolean;
  ordem: number;
}
