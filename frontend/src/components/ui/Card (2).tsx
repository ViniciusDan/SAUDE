import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  shadow?: boolean;
}

export function Card({ children, className = "", padding = "md", shadow = true }: CardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  
  return (
    <div
      className={`
        bg-white dark:bg-[#111319] rounded-lg border border-[#e5e7ef] dark:border-[#2b2f3b]
        ${paddings[padding]}
        ${shadow ? "shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function CardHeader({ title, subtitle, action, children }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        {title && <h3 className="text-xl font-semibold text-[#212529] dark:text-white mb-1">{title}</h3>}
        {subtitle && <p className="text-sm text-[#6c757d] dark:text-gray-400">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

