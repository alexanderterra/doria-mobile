import React from "react";
import { HistoryItem } from "./HistoryItem";

export interface DiaryEntry {
  id: number | string;
  date: string;
  level: number;
  sleepLevel?: number; 
  anxietyLevel?: number;
  note: string;
}

interface HistoryListProps {
  entries: DiaryEntry[];
  onFilterPress?: () => void;
  onEditPress?: (entry: DiaryEntry) => void;
}

export function HistoryList({
  entries,
  onEditPress,
}: HistoryListProps) {
  return (
    <>
      {entries.map((entry, index) => (
        <HistoryItem
          key={`${entry.id}-${index}`}
          {...entry}
          onEdit={() => onEditPress && onEditPress(entry)}
        />
      ))}
    </>
  );
}
