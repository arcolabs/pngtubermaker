import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

function loadMessages(locale: string): Record<string, unknown> {
  const dir = join(process.cwd(), "messages", locale);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const messages: Record<string, unknown> = {};

  for (const f of files) {
    const ns = f.replace(/\.json$/, "");
    messages[ns] = JSON.parse(readFileSync(join(dir, f), "utf-8"));
  }

  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  // biome-ignore lint/suspicious/noExplicitAny: next-intl locale validation
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: loadMessages(locale),
  };
});
