import { ReactNode, useMemo, useState } from "react";
import { formatDate } from "../utils/formatters";

type TimelineItemType =
  | "encounter"
  | "observation"
  | "procedure"
  | "medication"
  | "medication_start"
  | "medication_end"
  | "condition"
  | "condition_resolved"
  | "allergy"
  | "document_received"
  | "document_personal";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: TimelineItemType;
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  initialVisibleCount?: number;
  showToggleButton?: boolean;
}

const typeColors: Record<TimelineItemType, string> = {
  encounter: "bg-[#233B6E]",
  observation: "bg-[#8FB6E8]",
  procedure: "bg-[#c62828]",
  medication: "bg-[#DCEAF8]",
  medication_start: "bg-[#DCEAF8]",
  medication_end: "bg-[#BFD7F2]",
  condition: "bg-[#6F7F95]",
  condition_resolved: "bg-[#34A853]",
  allergy: "bg-[#F4B183]",
  document_received: "bg-[#7C9DC5]",
  document_personal: "bg-[#A9C7E8]"
};

const typeTextColors: Record<TimelineItemType, string> = {
  encounter: "text-white",
  observation: "text-white",
  procedure: "text-white",
  medication: "text-[#233B6E]",
  medication_start: "text-[#233B6E]",
  medication_end: "text-[#233B6E]",
  condition: "text-white",
  condition_resolved: "text-white",
  allergy: "text-white",
  document_received: "text-white",
  document_personal: "text-[#233B6E]"
};

const typeIcons: Record<TimelineItemType, ReactNode> = {
  encounter: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  observation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  procedure: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  medication: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  medication_start: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  medication_end: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  condition: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  condition_resolved: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  allergy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.53 20h14.94a2 2 0 001.74-3.14l-7.5-13a2 2 0 00-3.42 0z" />
    </svg>
  ),
  document_received: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  ),
  document_personal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 12l-4-4m4 4l4-4M6 20h12" />
    </svg>
  )
};

export function Timeline({
  items,
  initialVisibleCount = 3,
  showToggleButton = true
}: TimelineProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [items]
  );

  const visibleItems =
    showToggleButton && !showAll
      ? sortedItems.slice(0, initialVisibleCount)
      : sortedItems;

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#C9D9EA] dark:bg-[#333]" />

      <div className="space-y-6">
        {visibleItems.map((item) => (
          <div key={item.id} className="relative flex gap-4">
            <div
              className={`
                relative z-10 flex items-center justify-center
                w-8 h-8 rounded-full
                ${typeColors[item.type]} ${typeTextColors[item.type]}
                shadow-md
              `}
            >
              {item.icon || typeIcons[item.type]}
            </div>

            <div className="flex-1 pb-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#C9D9EA] dark:border-[#333] p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2 gap-4">
                  <h4 className="font-semibold text-[#233B6E] dark:text-white">{item.title}</h4>
                  <span className="text-xs text-[#6F7F95] dark:text-gray-400 whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showToggleButton && sortedItems.length > initialVisibleCount && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-semibold text-[#233B6E] dark:text-blue-300 hover:underline"
          >
            {showAll ? "Ver menos eventos" : "Ver todos os eventos"}
            <svg
              className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}