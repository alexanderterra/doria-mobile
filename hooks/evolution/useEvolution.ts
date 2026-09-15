import { evolutionService } from "@/services/evolution/evolutionService";
import { EvolutionItem } from "@/types/evolution";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export type EvolutionFilterType =
  | "ultimos_7_cards"
  | "7_dias"
  | "15_dias"
  | "mes_especifico"
  | "todos";

export function useEvolutions() {
  const [evolutions, setEvolutions] = useState<EvolutionItem[]>([]);
  const [filteredEvolutions, setFilteredEvolutions] = useState<EvolutionItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] =
    useState<EvolutionFilterType>("ultimos_7_cards");
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());

  const getSafeDate = (dateRaw: any) => {
    if (!dateRaw) return new Date();
    const dateString = String(dateRaw).replace(" ", "T");
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const fetchEvolutions = async () => {
    setIsLoading(true);
    const response = await evolutionService.getEvolutions();

    if (response.success && response.data) {
      setEvolutions(response.data);
    }
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvolutions();
    }, []),
  );

  useEffect(() => {
    applyFilter(activeFilter, selectedMonthDate);
  }, [evolutions]);

  const applyFilter = (
    filter: EvolutionFilterType,
    date: Date = new Date(),
  ) => {
    let filtered = [...evolutions];

    if (filter === "ultimos_7_cards") {
      filtered = filtered.slice(0, 7);
    } else if (filter === "todos") {
    } else if (filter === "mes_especifico") {
      const filterDay = date.getDate();
      const filterMonth = date.getMonth();
      const filterYear = date.getFullYear();

      filtered = filtered.filter((item) => {
        const itemDate = getSafeDate(item.criado_em);
        return (
          itemDate.getDate() === filterDay &&
          itemDate.getMonth() === filterMonth &&
          itemDate.getFullYear() === filterYear
        );
      });
    } else {
      const daysToSubtract = filter === "7_dias" ? 7 : 15;

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const pastDate = new Date();
      pastDate.setDate(endOfToday.getDate() - daysToSubtract);
      pastDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((item) => {
        const itemDate = getSafeDate(item.criado_em);
        return itemDate >= pastDate && itemDate <= endOfToday;
      });
    }

    setFilteredEvolutions(filtered);
    setActiveFilter(filter);
    setSelectedMonthDate(date);
  };

  return {
    evolutions: filteredEvolutions,
    isLoading,
    activeFilter,
    selectedMonthDate,
    applyFilter,
    refetch: fetchEvolutions,
  };
}
