import { DiaryEntry } from "@/components/diary/HistoryList";
import { useMemo, useState } from "react";

export type FilterType =
  | "ultimos_7_cards"
  | "7_dias"
  | "15_dias"
  | "mes_especifico"
  | "todos";

export function useDiaryFilters(history: DiaryEntry[]) {
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("ultimos_7_cards");
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());

  const getSafeDate = (dateRaw: any) => {
    if (!dateRaw) return new Date();
    const dateString = String(dateRaw).replace(" ", "T");
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === "ultimos_7_cards") return history.slice(0, 7);

    if (activeFilter === "todos") return history;

    if (activeFilter === "mes_especifico") {
      const filterDay = selectedMonthDate.getDate();
      const filterMonth = selectedMonthDate.getMonth();
      const filterYear = selectedMonthDate.getFullYear();

      return history.filter((entry) => {
        const itemDate = getSafeDate(entry.date || (entry as any).criado_em);

        return (
          itemDate.getDate() === filterDay &&
          itemDate.getMonth() === filterMonth &&
          itemDate.getFullYear() === filterYear
        );
      });
    }

    const daysToSubtract = activeFilter === "7_dias" ? 7 : 15;

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const pastDate = new Date();
    pastDate.setDate(endOfToday.getDate() - daysToSubtract);
    pastDate.setHours(0, 0, 0, 0);

    return history.filter((entry) => {
      const itemDate = getSafeDate(entry.date || (entry as any).criado_em);
      return itemDate >= pastDate && itemDate <= endOfToday;
    });
  }, [history, activeFilter, selectedMonthDate]);

  const getFilterTitle = (): string => {
    if (activeFilter === "ultimos_7_cards") return "Últimos Registros";
    if (activeFilter === "7_dias") return "Últimos 7 dias";
    if (activeFilter === "15_dias") return "Últimos 15 dias";
    if (activeFilter === "todos") return "Todo o Histórico";

    return selectedMonthDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isFilterActive = (filter: FilterType): boolean => {
    if (filter === "mes_especifico") return activeFilter === "mes_especifico";
    return activeFilter === filter;
  };

  return {
    activeFilter,
    setActiveFilter,
    selectedMonthDate,
    setSelectedMonthDate,
    filteredHistory,
    getFilterTitle,
    isFilterActive,
  };
}
