import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Mobile: show simplified view - just back button or first + last
  const hasMultipleItems = items.length > 1;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return (
    <nav className="mb-4 sm:mb-6">
      {/* Mobile View */}
      <div className="sm:hidden">
        {hasMultipleItems ? (
          <div className="flex items-center gap-2">
            {/* Back to previous */}
            {firstItem.href ? (
              <Link
                href={firstItem.href}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[100px]">
                  {firstItem.label}
                </span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span className="truncate max-w-[100px]">
                  {firstItem.label}
                </span>
              </span>
            )}

            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />

            {/* Current page */}
            <span className="text-sm text-gray-900 font-medium truncate max-w-[120px]">
              {lastItem.label}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-gray-900 font-medium">
            <Home className="w-4 h-4 text-gray-400" />
            <span>{lastItem.label}</span>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
        {items.map((item, i) => {
          const key = `${i}-${item.label}`;
          const isLast = i === items.length - 1;

          return (
            <Fragment key={key}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`truncate max-w-[200px] ${isLast ? "text-gray-700 font-medium" : ""}`}
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
