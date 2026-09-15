import { CourseCategory, CourseLesson, CourseVideo } from "@/types/courses";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CursoCategoria {
  id: string;
  titulo: string;
  slug: string;
  ordem: number;
}

interface CursoLicao {
  id: string;
  curso_id: string;
  titulo: string;
  palestrante: string;
  ordem: number;
}

interface Curso {
  id: string;
  categoria_id: string;
  titulo: string;
  descricao: string;
  tipo: "youtube" | "plataforma_externa";
  youtube_id: string | null;
  plataforma_nome: string | null;
  link_externo: string | null;
  imagem_capa_url: string | null;
  autor: string | null;
  formato: string | null;
  duracao_exibicao: string | null;
  disponibilidade: string | null;
  possui_certificado: boolean;
  ordem: number;
  categoria?: CursoCategoria;
  licoes?: CursoLicao[];
}

const INVISIBLE_CHAR_CODES = [0x2028, 0x200b, 0x200c, 0x200d, 0xfeff];
const INVISIBLE_CHARS_REGEX = new RegExp(
  `[${INVISIBLE_CHAR_CODES.map((code) => String.fromCharCode(code)).join("")}]`,
  "g",
);

function getCourseCoverUrl(curso: Curso): string {
  if (curso.imagem_capa_url) {
    const clean = curso.imagem_capa_url.replace(INVISIBLE_CHARS_REGEX, "").trim();
    if (clean) return clean;
  }
  if (curso.youtube_id) {
    return `https://img.youtube.com/vi/${curso.youtube_id}/hqdefault.jpg`;
  }
  return "https://via.placeholder.com/400x200.png?text=Curso+Dor.ia";
}

function mapCursoToCourseVideo(curso: Curso): CourseVideo {
  const curriculum: CourseLesson[] | undefined = curso.licoes?.map(
    (licao) => ({
      title: licao.titulo,
      speaker: licao.palestrante,
    }),
  );

  return {
    id: curso.id,
    title: curso.titulo,
    description: curso.descricao,
    youtubeId: curso.youtube_id ?? undefined,
    externalLink: curso.link_externo ?? undefined,
    author: curso.autor ?? undefined,
    format: curso.formato ?? undefined,
    durationInfo: curso.duracao_exibicao ?? undefined,
    availability: curso.disponibilidade ?? undefined,
    hasCertificate: curso.possui_certificado,
    curriculum,
    coverUrl: getCourseCoverUrl(curso),
  };
}

function groupByCategory(cursos: Curso[]): CourseCategory[] {
  const categorySort = [...cursos].sort((a, b) => {
    const ordemA = a.categoria?.ordem ?? 0;
    const ordemB = b.categoria?.ordem ?? 0;
    return ordemA - ordemB;
  });

  const categories = new Map<string, { meta: CourseCategory; cursos: Curso[] }>();

  for (const curso of categorySort) {
    const categoryId = curso.categoria_id;
    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        meta: {
          id: categoryId,
          sectionTitle: curso.categoria?.titulo ?? "",
          videos: [],
        },
        cursos: [],
      });
    }
    categories.get(categoryId)!.cursos.push(curso);
  }

  return Array.from(categories.values()).map(({ meta, cursos: catCursos }) => ({
    ...meta,
    videos: [...catCursos]
      .sort((a, b) => a.ordem - b.ordem)
      .map(mapCursoToCourseVideo),
  }));
}

export const coursesService = {
  getCatalog: async (): Promise<ApiResponse<CourseCategory[]>> => {
    try {
      const response = await api.get("/cursos", { params: { limit: 100 } });
      const cursos: Curso[] = response.data?.cursos ?? [];

      return { success: true, data: groupByCategory(cursos) };
    } catch (error: any) {
      console.error(
        "Erro ao buscar catálogo de cursos:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Não foi possível carregar os cursos.",
      };
    }
  },
};
