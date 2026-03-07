import {
  ArrowRight,
  Gamepad2,
  MonitorPlay,
  Palette,
  PlayCircle,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ExplorePages() {
  const t = await getTranslations("explorePages");

  const pages = [
    {
      href: "/vtuber-maker",
      icon: Sparkles,
      title: t("vtuberMaker"),
      description: t("vtuberMakerDesc"),
    },
    {
      href: "/style/anime",
      icon: Palette,
      title: t("animeAvatarMaker"),
      description: t("animeAvatarMakerDesc"),
    },
    {
      href: "/guides/how-to-make-a-pngtuber",
      icon: PlayCircle,
      title: t("howToMakePngtuber"),
      description: t("howToMakePngtuberDesc"),
    },
    {
      href: "/free-pngtuber-maker",
      icon: Zap,
      title: t("freePngtuberMaker"),
      description: t("freePngtuberMakerDesc"),
    },
    {
      href: "/for/twitch",
      icon: MonitorPlay,
      title: t("twitchAvatarMaker"),
      description: t("twitchAvatarMakerDesc"),
    },
    {
      href: "/for/youtube",
      icon: Youtube,
      title: t("youtubeAvatarMaker"),
      description: t("youtubeAvatarMakerDesc"),
    },
    {
      href: "/for/discord",
      icon: Gamepad2,
      title: t("discordAvatarMaker"),
      description: t("discordAvatarMakerDesc"),
    },
  ];
  return (
    <section className="py-16 sm:py-20 bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group flex items-start gap-3 p-5 rounded-xl border border-base-300 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1">
                    {page.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {page.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
