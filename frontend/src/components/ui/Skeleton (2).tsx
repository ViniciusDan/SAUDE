interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width = "100%", height = "1rem", className = "", rounded = false }: SkeletonProps) {
  return (
    <div
      className={`
        bg-[#e5e7ef] animate-pulse
        ${rounded ? "rounded-full" : "rounded"}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7ef] p-6 shadow-md">
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

