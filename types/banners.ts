export type BannerTipoLink = "interno" | "externo";

export type BannerLocal =
  | "chat_sidebar_web"
  | "sidebar_nav_web"
  | "consultas_mobile"
  | "medicacoes_mobile"
  | "evolucao_mobile"
  | "completar_perfil_mobile"
  | "certificados_mobile"
  | "cursos_mobile";

export type BannerPublico = "especialista" | "paciente" | "ambos";

export interface Banner {
  id: string;
  titulo: string;
  texto_alternativo: string;
  imagem_url: string;
  tipo_link: BannerTipoLink;
  link_destino: string | null;
  publico_alvo: BannerPublico;
  local: BannerLocal;
  ordem: number;
}
