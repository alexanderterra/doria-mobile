import { termsService } from "@/services/terms/termsService";
import { useEffect, useState } from "react";

const FALLBACK_URL = "https://falecomadoria.com.br/termos-e-condicoes";

export function useTermsUrls() {
  const [urlTermoUso, setUrlTermoUso] = useState(FALLBACK_URL);
  const [urlPrivacidade, setUrlPrivacidade] = useState(FALLBACK_URL);

  useEffect(() => {
    const loadTerms = async () => {
      const [termoUsoResult, privacidadeResult] = await Promise.all([
        termsService.getVigente("termo_uso"),
        termsService.getVigente("privacidade"),
      ]);

      if (termoUsoResult.success && termoUsoResult.data) {
        setUrlTermoUso(termoUsoResult.data.url_conteudo);
      }
      if (privacidadeResult.success && privacidadeResult.data) {
        setUrlPrivacidade(privacidadeResult.data.url_conteudo);
      }
    };

    loadTerms();
  }, []);

  return { urlTermoUso, urlPrivacidade };
}
