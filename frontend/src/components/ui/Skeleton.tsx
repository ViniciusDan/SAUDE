interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  className = "",
  rounded = false
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-[#DCEAF8] dark:bg-[#2b2f3b] animate-pulse
        ${rounded ? "rounded-full" : "rounded-lg"}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#C9D9EA] dark:border-[#2b2f3b] p-6 shadow-sm">
      <Skeleton height="1.5rem" width="60%" className="mb-4" />
      <Skeleton height="1rem" width="100%" className="mb-2" />
      <Skeleton height="1rem" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="1rem" width="30%" />
        </div>
      ))}
    </div>
  );
}