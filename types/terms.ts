export type TermType =
  | "termo_uso"
  | "privacidade"
  | "termo_veracidade_profissional"
  | "lgpd_consentimento";

export interface Term {
  id: string;
  tipo: TermType;
  versao: string;
  url_conteudo: string;
  vigente_desde: string;
}
