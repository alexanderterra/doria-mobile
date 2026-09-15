import { useEffect, useState } from "react";

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthYear, setMonthYear] = useState("");
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    generateWeekStrip(selectedDate);
  }, [selectedDate]);

  const generateWeekStrip = (baseDate: Date) => {
    const mesStr = baseDate.toLocaleDateString("pt-BR", { month: "long" });
    const mesCapitalizado = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
    setMonthYear(`${mesCapitalizado} ${baseDate.getFullYear()}`);

    const weekDays = [];
    const diaDaSemanaIndex = baseDate.getDay();
    const dataInicialDaSemana = new Date(baseDate);
    const ajusteParaSegunda =
      diaDaSemanaIndex === 0 ? -6 : 1 - diaDaSemanaIndex;
    dataInicialDaSemana.setDate(baseDate.getDate() + ajusteParaSegunda);
    const hoje = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(dataInicialDaSemana);
      currentDay.setDate(dataInicialDaSemana.getDate() + i);

      const isToday =
        currentDay.getDate() === hoje.getDate() &&
        currentDay.getMonth() === hoje.getMonth() &&
        currentDay.getFullYear() === hoje.getFullYear();

      weekDays.push({
        id: i,
        dayWeek: currentDay
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        dayNum: String(currentDay.getDate()).padStart(2, "0"),
        fullDate: currentDay,
        isToday: isToday,
      });
    }

    setDays(weekDays);
  };

  return {
    selectedDate,
    setSelectedDate,
    monthYear,
    days,
  };
}
