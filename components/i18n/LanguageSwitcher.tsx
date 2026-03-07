"use client";

import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  defaultLocale,
  type Locale,
  localeNames,
  locales,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "header";
}

export default function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const listboxId = `${id}-listbox`;
  const isHeader = variant === "header";
  const optionIds = useMemo(
    () => locales.map((_, index) => `${id}-option-${index}`),
    [id],
  );

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

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

    const newPath =
      newLocale === defaultLocale ? path || "/" : `/${newLocale}${path}`;

    setIsOpen(false);
    setFocusedIndex(-1);
    router.push(newPath);
  }

  const open = useCallback(
    (initialIndex?: number) => {
      setIsOpen(true);
      setFocusedIndex(initialIndex ?? locales.indexOf(locale));
    },
    [locale],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen]);

  // Close on scroll (mobile UX)
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => {
      setIsOpen(false);
      setFocusedIndex(-1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!isOpen) {
          open();
        } else if (focusedIndex >= 0) {
          const selectedLocale = locales[focusedIndex];
          if (selectedLocale) switchLocale(selectedLocale);
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (!isOpen) {
          open(0);
        } else {
          setFocusedIndex((i) => (i + 1) % locales.length);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!isOpen) {
          open(locales.length - 1);
        } else {
          setFocusedIndex((i) => (i - 1 + locales.length) % locales.length);
        }
        break;
      }
      case "Home": {
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
        }
        break;
      }
      case "End": {
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(locales.length - 1);
        }
        break;
      }
      case "Escape": {
        if (isOpen) {
          e.preventDefault();
          close();
        }
        break;
      }
      case "Tab": {
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      }
      default: {
        // Type-ahead: single printable character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          clearTimeout(typeaheadTimerRef.current);
          typeaheadRef.current += e.key.toLowerCase();

          const search = typeaheadRef.current;
          const matchIndex = locales.findIndex((loc) =>
            localeNames[loc].toLowerCase().startsWith(search),
          );
          if (matchIndex >= 0) {
            if (!isOpen) open(matchIndex);
            else setFocusedIndex(matchIndex);
          }

          typeaheadTimerRef.current = setTimeout(() => {
            typeaheadRef.current = "";
          }, 500);
        }
      }
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || focusedIndex >= optionIds.length) return;
    const optionId = optionIds[focusedIndex];
    if (!optionId) return;
    const el = document.getElementById(optionId);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, isOpen, optionIds]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Container needs keyboard handling for dropdown
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-lg transition-colors",
          isHeader
            ? "px-2.5 py-1.5 text-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
            : "px-2.5 py-1.5 text-sm text-base-content/60 hover:text-base-content hover:bg-base-200",
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => (isOpen ? close() : open())}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Select language"
          className={cn(
            "absolute z-50 max-h-72 w-44 overflow-y-auto rounded-xl border p-1.5 shadow-xl",
            isHeader
              ? "right-0 top-full mt-2 border-base-content/10 bg-base-100"
              : "right-0 bottom-full mb-2 border-base-content/5 bg-base-100",
          )}
        >
          {locales.map((loc, index) => {
            const isCurrent = loc === locale;
            const isFocused = index === focusedIndex;
            return (
              <button
                key={loc}
                type="button"
                id={optionIds[index]}
                role="option"
                aria-selected={isCurrent}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
                  isCurrent && "text-primary font-medium",
                  !isCurrent && "text-base-content/70",
                  isFocused && "bg-base-200",
                  !isFocused && "hover:bg-base-200",
                )}
                onPointerEnter={() => setFocusedIndex(index)}
                onPointerMove={() => setFocusedIndex(index)}
                onClick={() => switchLocale(loc)}
              >
                <span className={cn("w-4 shrink-0", !isCurrent && "invisible")}>
                  {isCurrent && <Check className="w-4 h-4" />}
                </span>
                {localeNames[loc]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
