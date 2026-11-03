import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-[#212529] font-medium dark:text-white">{item.label}</span>
            ) : item.path ? (
              <Link
                to={item.path}
                className="text-[#1351B4] hover:underline dark:text-blue-400"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#6c757d] dark:text-gray-400">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

