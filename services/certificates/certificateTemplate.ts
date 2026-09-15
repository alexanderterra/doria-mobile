import { Certificate } from "@/types/certificates";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCertificateHtml(
  nome: string,
  certificado: Pick<
    Certificate,
    "nome_evento" | "datas_evento_texto" | "carga_horaria_texto"
  >,
  backgroundImageSrc: string,
) {
  const safeName = escapeHtml(nome.trim());
  const safeEventLabel = escapeHtml(certificado.nome_evento);
  const safeEventDates = escapeHtml(certificado.datas_evento_texto);
  const safeWorkload = escapeHtml(certificado.carga_horaria_texto);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @page { size: 842pt 595pt; margin: 0; }
      html, body { width: 842pt; height: 595pt; overflow: hidden; }
      .page { width: 842pt; height: 595pt; position: relative; }
      .bg-image { position: absolute; top: 0; left: 0; width: 842pt; height: 595pt; display: block; }
      .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 842pt;
        height: 595pt;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .text-container { width: 75%; margin-top: 55pt; }
      .text {
        font-size: 14pt;
        color: #334155;
        line-height: 1.6;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      .name {
        font-size: 24pt;
        color: #0F172A;
        font-weight: bold;
        margin: 16pt 0;
        border-bottom: 0.8pt solid #CBD5E1;
        display: inline-block;
        padding-bottom: 4pt;
        text-transform: uppercase;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <img src="${backgroundImageSrc}" class="bg-image" />
      <div class="content">
        <div class="text-container">
          <div class="text">Certificamos que</div>
          <div class="name">${safeName}</div>
          <div class="text">
            participou do evento <strong>${safeEventLabel}</strong>, ${safeEventDates}.<br/><br/>
            Carga horária: ${safeWorkload}.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
