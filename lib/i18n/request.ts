import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const messageCache = new Map<string, Record<string, unknown>>();

function loadMessages(locale: string): Record<string, unknown> {
  const cached = messageCache.get(locale);
  if (cached) return cached;

  const dir = join(process.cwd(), "messages", locale);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const messages: Record<string, unknown> = {};

  for (const f of files) {
    const ns = f.replace(/\.json$/, "");
    messages[ns] = JSON.parse(readFileSync(join(dir, f), "utf-8"));
  }

  messageCache.set(locale, messages);
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  // biome-ignore lint/suspicious/noExplicitAny: next-intl locale validation
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const resolvedLocale = locale as string;
  try {
    return {
      locale: resolvedLocale,
      messages: loadMessages(resolvedLocale),
    };
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (
      resolvedLocale !== routing.defaultLocale &&
      err.code === "ENOENT"
    ) {
      return {
        locale: routing.defaultLocale,
        messages: loadMessages(routing.defaultLocale),
      };
    }
    throw error;
  }
});
