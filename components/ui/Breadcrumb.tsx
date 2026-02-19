import { ChevronRight } from "lucide-react";
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
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
      {items.map((item, i) => {
        const key = item.href || item.label;
        return (
          <Fragment key={key}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-medium">{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
