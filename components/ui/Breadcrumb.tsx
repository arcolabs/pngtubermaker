import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="breadcrumbs text-sm mb-8">
      <ul>
        {items.map((item) => {
          const isLast = item === items[items.length - 1];

          return (
            <li key={`${item.label}-${item.href || "last"}`}>
              {isLast ? (
                <span className="text-base-content font-medium">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
