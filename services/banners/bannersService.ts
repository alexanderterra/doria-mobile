import { Banner, BannerLocal, BannerPublico } from "@/types/banners";
import { api } from "../api/api";


export const bannersService = {
  getBannerParaLocal: async (
    local: BannerLocal,
    publicoAlvo?: BannerPublico,
  ): Promise<Banner | null> => {
    try {
      const response = await api.get("/banners", {
        params: { local, ...(publicoAlvo ? { publico_alvo: publicoAlvo } : {}) },
      });
      const banners: Banner[] = response.data?.banners ?? [];
      if (banners.length === 0) return null;
      return [...banners].sort((a, b) => a.ordem - b.ordem)[0];
    } catch (error: any) {
      console.error(
        "Erro ao buscar banners:",
        error.response?.data || error.message,
      );
      return null;
    }
  },
};
