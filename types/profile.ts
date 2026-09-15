export type UserRole = "paciente" | "especialista";

export interface Specialty {
  name: string;
  register: string | null;
}

export interface DadosPessoais {
  nome: string;
  email: string;
  dataNascimento: string;
  telefone: string;
  cpf?: string;
  sexoBiologico?: string;
  areaAtuacao?: string;
}

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DadosClinica {
  nomeClinica: string;
  especialidade: string;
  emailClinica: string;
  telefoneClinica: string;
  siteClinica?: string;
  tipoAtendimento: string;
  horario: string;

  tipoConsulta?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  miniCurriculo?: string;
  termoAceito?: boolean;
  profissao?: string;
  conselhoTipo?: string;
  conselhoUF?: string;
  conselhoNumero?: string;
  especialidades?: Specialty[];
  convenios?: string[];
}

export interface ProfileFormState {
  dadosPessoais: DadosPessoais;
  enderecoPessoal: Endereco;
  dadosClinica: DadosClinica;
  enderecoClinica: Endereco;
}

export const EMPTY_ENDERECO: Endereco = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

export const EMPTY_DADOS_PESSOAIS: DadosPessoais = {
  nome: "",
  email: "",
  dataNascimento: "",
  telefone: "",
  cpf: "",
  sexoBiologico: "",
  areaAtuacao: "",
};

export const EMPTY_DADOS_CLINICA: DadosClinica = {
  nomeClinica: "",
  especialidade: "",
  emailClinica: "",
  telefoneClinica: "",
  siteClinica: "",
  tipoAtendimento: "",
  horario: "",

  tipoConsulta: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  miniCurriculo: "",
  termoAceito: false,
  profissao: "",
  conselhoTipo: "",
  conselhoUF: "",
  conselhoNumero: "",
  especialidades: [],
  convenios: [],
};
