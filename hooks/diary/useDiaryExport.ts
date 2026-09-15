import { DiaryEntry } from "@/components/diary/HistoryList";
import { api } from "@/services/api/api";
import { evolutionService } from "@/services/evolution/evolutionService";
import { medicationsService } from "@/services/medications/medicationsService";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";

export function useDiaryExport() {
  const [isExporting, setIsExporting] = useState(false);

  const getMetricStyle = (val?: number | null) => {
    if (val === undefined || val === null)
      return "background-color: #F1F5F9; color: #64748B;";
    if (val <= 3) return "background-color: #DCFCE7; color: #166534;";
    if (val <= 6) return "background-color: #FEF3C7; color: #92400E;";
    return "background-color: #FEE2E2; color: #991B1B;";
  };

  const getMetricText = (val?: number | null) => {
    if (val === undefined || val === null) return "-";
    return `${val}/10`;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString(
        "pt-BR",
        { hour: "2-digit", minute: "2-digit" },
      )}`;
    } catch {
      return dateStr;
    }
  };

  const exportToPDF = async (
    entries: DiaryEntry[],
    patientFullName?: string,
  ) => {
    if (entries.length === 0) {
      Alert.alert("Aviso", "Não há registros neste período para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      const evolutionResponse = await evolutionService.getEvolutions();
      const evolutions = evolutionResponse.success
        ? evolutionResponse.data
        : [];

      let medsHistory: any[] = [];
      let userMeds: any[] = [];

      try {
        const medsRes = await api.get("/controle-medicacoes");
        if (medsRes.data && medsRes.data.controle_medicacoes) {
          medsHistory = medsRes.data.controle_medicacoes;
        }

        const myMedsRes = await medicationsService.getMedications();
        if (myMedsRes.success && myMedsRes.data) {
          userMeds = myMedsRes.data;
        }
      } catch (err) {
        console.log("Erro ao buscar dados de medicações para o PDF:", err);
      }

      const firstName = patientFullName
        ? patientFullName.split(" ")[0]
        : "Paciente";

      const jornadaRows = entries
        .map(
          (item) => `
        <tr>
          <td class="date-cell">${item.date}</td>
          <td><span class="badge" style="${getMetricStyle(
            item.level,
          )}">${getMetricText(item.level)}</span></td>
          <td><span class="badge" style="${getMetricStyle(
            item.sleepLevel,
          )}">${getMetricText(item.sleepLevel)}</span></td>
          <td><span class="badge" style="${getMetricStyle(
            item.anxietyLevel,
          )}">${getMetricText(item.anxietyLevel)}</span></td>
          <td class="note-cell">${item.note || "<i>Sem observações.</i>"}</td>
        </tr>
      `,
        )
        .join("");

      const evolucaoBlocks =
        evolutions.length > 0
          ? evolutions
              .map((evo: any) => {
                const dataEvolucao = formatDateTime(
                  evo.criado_em ||
                    evo.created_at ||
                    evo.data ||
                    new Date().toISOString(),
                );

                return `
          <div class="evo-block">
            <h3>Avaliação do dia ${dataEvolucao}</h3>
            
            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Início</span>
                <span class="evo-sub-label">Quando essa dor começou?</span>
              </div>
              <div class="evo-value">${evo.inicio || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Localização</span>
                <span class="evo-sub-label">Onde dói exatamente?</span>
              </div>
              <div class="evo-value">${evo.localizacao || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Duração</span>
                <span class="evo-sub-label">Por quanto tempo sua dor dura?</span>
              </div>
              <div class="evo-value">${evo.duracao || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Característica</span>
                <span class="evo-sub-label">Como você descreve essa dor?</span>
              </div>
              <div class="evo-value">${evo.caracteristica || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Fatores e Atribuição</span>
                <span class="evo-sub-label">O que melhora ou piora? O que causou?</span>
              </div>
              <div class="evo-value">${evo.fatores || evo.alivioAgravamento || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Irradiação</span>
                <span class="evo-sub-label">A dor se espalha para outro lugar?</span>
              </div>
              <div class="evo-value">${evo.irradiacao || "-"}</div>
            </div>

            <div class="evo-row">
              <div class="evo-label-box">
                <span class="evo-main-label">Padrão Temporal</span>
                <span class="evo-sub-label">A dor varia ao longo do dia?</span>
              </div>
              <div class="evo-value">${evo.padrao_temporal || evo.padraoTemporal || "-"}</div>
            </div>

            <div class="evo-row" style="border-bottom: none; padding-bottom: 0;">
              <div class="evo-label-box">
                <span class="evo-main-label">Sintomas Associados</span>
                <span class="evo-sub-label">Como a dor afeta seu sono ou humor?</span>
              </div>
              <div class="evo-value">${evo.sintomas_associados || evo.sintomasAssociados || "-"}</div>
            </div>
          </div>
        `;
              })
              .join("")
          : `<p style="color: #64748B; font-size: 13px;">Nenhuma evolução detalhada registrada pelo paciente até o momento.</p>`;

      const medsRows =
        medsHistory.length > 0
          ? medsHistory
              .map((med: any) => {
                const statusStyle = med.tomou
                  ? "background-color: #DCFCE7; color: #166534;"
                  : "background-color: #FEE2E2; color: #991B1B;";
                const statusText = med.tomou ? "Tomou" : "Não tomou";

                const medicamentoEncontrado = userMeds.find(
                  (m: any) =>
                    String(m.id_medicacoes) === String(med.id_medicacoes) ||
                    String(m.id) === String(med.id_medicacoes) ||
                    String(m.uuid) === String(med.id_medicacoes),
                );

                const nomeRemedio =
                  medicamentoEncontrado?.nome ||
                  medicamentoEncontrado?.medicationName ||
                  "Medicação (Removida)";
                const dataHora = med.criado_em || med.created_at;

                return `
              <tr>
                <td class="date-cell">${formatDateTime(dataHora)}</td>
                <td><strong>${nomeRemedio}</strong></td>
                <td><span class="badge" style="${statusStyle}">${statusText}</span></td>
              </tr>
            `;
              })
              .join("")
          : `<tr><td colspan="3" style="text-align: center; color: #64748B; font-style: italic;">Nenhum registro de medicação encontrado.</td></tr>`;

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                padding: 40px; 
                color: #1E293B; 
                line-height: 1.5;
              }
              .header-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #0F172A;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .brand-title {
                font-size: 28px;
                font-weight: 800;
                color: #0F172A;
                margin: 0;
                letter-spacing: -1px;
              }
              .brand-subtitle {
                font-size: 12px;
                color: #64748B;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .doc-info {
                text-align: right;
                font-size: 13px;
                color: #475569;
              }
              .doc-info strong { color: #0F172A; }
              
              .section-title {
                font-size: 16px;
                font-weight: 700;
                color: #0F172A;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 15px;
                border-left: 4px solid #3B82F6;
                padding-left: 10px;
              }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
              th { background-color: #0F172A; color: #FFFFFF; text-align: left; padding: 14px 12px; font-weight: 600; }
              td { padding: 14px 12px; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }
              .date-cell { font-weight: 600; color: #334155; }
              .note-cell { color: #475569; font-size: 12px; }
              .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 12px; text-align: center; min-width: 35px; }
              
              .evo-block {
                background-color: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                font-size: 13px;
              }
              .evo-block h3 { margin-top: 0; color: #3B82F6; font-size: 15px; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;}
              
              .evo-row { 
                display: flex; 
                margin-bottom: 14px; 
                border-bottom: 1px dashed #E2E8F0; 
                padding-bottom: 10px;
              }
              
              .evo-label-box { 
                width: 45%; 
                flex-shrink: 0; 
                padding-right: 16px; 
              }
              .evo-main-label { 
                display: block; 
                font-weight: 700; 
                color: #334155; 
                font-size: 13px;
              }
              .evo-sub-label { 
                display: block; 
                font-weight: 500; 
                color: #64748B; 
                font-style: italic; 
                font-size: 11px; 
                margin-top: 3px; 
                line-height: 1.3;
              }
              .evo-value { 
                flex: 1; 
                color: #475569; 
                align-self: center;
                font-size: 13px;
              }

              .footer { 
                margin-top: 50px; 
                font-size: 11px; 
                color: #94A3B8; 
                text-align: center; 
                border-top: 1px solid #E2E8F0; 
                padding-top: 15px; 
              }
            </style>
          </head>
          <body>
            <div class="header-container">
              <div>
                <h1 class="brand-title">DOR.IA</h1>
                <div class="brand-subtitle">Relatório Clínico Integrado</div>
              </div>
              <div class="doc-info">
                Paciente: <strong>${firstName}</strong><br/>
                Emissão: <strong>${new Date().toLocaleDateString("pt-BR")}</strong>
              </div>
            </div>

            <div class="section-title">Minha Jornada (Registros Diários)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">Data</th>
                  <th style="width: 12%">Dor</th>
                  <th style="width: 12%">Sono</th>
                  <th style="width: 12%">Emocional</th>
                  <th style="width: 49%">Anotações</th>
                </tr>
              </thead>
              <tbody>${jornadaRows}</tbody>
            </table>

            <div class="section-title" style="margin-top: 40px;">Controle de Medicações</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%">Data / Hora</th>
                  <th style="width: 50%">Medicamento</th>
                  <th style="width: 25%">Status</th>
                </tr>
              </thead>
              <tbody>${medsRows}</tbody>
            </table>

            <div class="section-title" style="margin-top: 40px;">Minha Evolução (Avaliações Detalhadas)</div>
            ${evolucaoBlocks}

            <div class="footer">
              Este relatório é um documento gerado automaticamente pelo sistema DOR.IA com base nos registros do paciente.<br/>
              Destina-se exclusivamente para auxílio no acompanhamento clínico e não substitui avaliação médica profissional.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Relatório DOR.IA - ${firstName}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToPDF,
  };
}
