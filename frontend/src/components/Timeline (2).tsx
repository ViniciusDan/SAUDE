import { ReactNode, useState } from "react";
import { formatDate, formatDateTime } from "../utils/formatters";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "encounter" | "observation" | "medication" | "procedure" | "condition";
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

const typeColors = {
  encounter: "bg-[#1351B4]",
  observation: "bg-[#34A853]",
  medication: "bg-[#fde047]",
  procedure: "bg-[#c62828]",
  condition: "bg-[#6c757d]"
};

const typeTextColors = {
  encounter: "text-white",
  observation: "text-white",
  medication: "text-[#1f2937]",
  procedure: "text-white",
  condition: "text-white"
};

const typeIcons = {
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
  medication: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  procedure: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  condition: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export function Timeline({ items }: TimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const sortedItems = [...items].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const visibleItems = showAll ? sortedItems : sortedItems.slice(0, 3);
  
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#e5e7ef] dark:bg-[#333]"></div>
      
      <div className="space-y-6">
        {visibleItems.map((item) => (
          <div key={item.id} className="relative flex gap-4">
            <div className={`
              relative z-10 flex items-center justify-center
              w-8 h-8 rounded-full
              ${typeColors[item.type]} ${typeTextColors[item.type]}
              shadow-md
            `}>
              {item.icon || typeIcons[item.type]}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#e5e7ef] dark:border-[#333] p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[#212529] dark:text-white">{item.title}</h4>
                  <span className="text-xs text-[#6c757d] dark:text-gray-400 whitespace-nowrap ml-4">
                    {formatDate(item.date)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-[#6c757d] dark:text-gray-400">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedItems.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#1351B4] dark:text-blue-300 hover:underline"
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
      )}
    </div>
  );
}

