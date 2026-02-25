import { Check, X } from "lucide-react";
import type { LandingComparison } from "@/lib/landing-pages";

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/15 text-success">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-base-300 text-gray-400">
        <X className="w-4 h-4" />
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function ComparisonTable({
  comparison,
}: {
  comparison: LandingComparison;
}) {
  return (
    <section className="py-16 sm:py-20 bg-base-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
          {comparison.title}
        </h2>
        {comparison.description && (
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            {comparison.description}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-base-300">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                {comparison.columns.map((col) => (
                  <th
                    key={col.label}
                    className={
                      col.highlight
                        ? "bg-primary/10 text-primary font-bold"
                        : ""
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.feature}>
                  <td className="font-medium text-gray-900">{row.feature}</td>
                  {row.values.map((val, i) => (
                    <td
                      key={`${row.feature}-${comparison.columns[i + 1]?.label}`}
                      className={
                        comparison.columns[i + 1]?.highlight
                          ? "bg-primary/5 font-medium text-gray-900"
                          : ""
                      }
                    >
                      <CellValue value={val} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
