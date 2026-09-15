import { BannerLocal } from "@/types/banners";

export const BANNER_TAMANHOS: Partial<
  Record<BannerLocal, { largura: number; altura: number }>
> = {
  consultas_mobile: { largura: 335, altura: 90 },
  medicacoes_mobile: { largura: 335, altura: 90 },
  evolucao_mobile: { largura: 335, altura: 100 },
  completar_perfil_mobile: { largura: 335, altura: 100 },
  certificados_mobile: { largura: 336, altura: 112 },
  cursos_mobile: { largura: 331, altura: 150 },
};
