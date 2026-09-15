export type CertificateValidationType = "lista_participantes" | "nenhuma";

export interface Certificate {
  id: string;
  slug: string;
  nome_evento: string;
  titulo_exibicao: string;
  descricao_exibicao: string;
  imagem_fundo_url: string;
  datas_evento_texto: string;
  carga_horaria_texto: string;
  tipo_validacao: CertificateValidationType;
  ordem: number;
}

export type CertificateDocumentType = "cpf" | "passaporte";

export interface CertificateValidation {
  valido: boolean;
  certificado?: Certificate;
}

export interface DynamicCertificateInscricao {
  id: string;
  nome: string;
  cpf: string;
  nome_certificado: string;
  associacao: string;
  id_associacao: string | null;
  url_template: string | null;
}
