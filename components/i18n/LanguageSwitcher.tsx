"use client";

import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultLocale,
  type Locale,
  localeNames,
  locales,
} from "@/lib/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  useEffect(() => {
    close();
  }, [close]);

  function switchLocale(newLocale: Locale) {
    // Strip current locale prefix from pathname
    let path = pathname;
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`)) {
        path = path.slice(`/${loc}`.length);
        break;
      }
      if (path === `/${loc}`) {
        path = "/";
        break;
      }
    }

    // Build new path
    const newPath =
      newLocale === defaultLocale ? path || "/" : `/${newLocale}${path}`;

    close();
    router.push(newPath);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-44 bg-base-100 rounded-xl shadow-xl border border-base-content/5 z-50 overflow-hidden max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Select language"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={loc === locale}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                loc === locale
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
