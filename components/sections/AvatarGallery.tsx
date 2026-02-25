import { Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface AvatarItem {
  src: string;
  alt: string;
  prompt: string;
}

const defaultAvatars: AvatarItem[] = [
  {
    src: "/images/showcase/fox_pngtuber.png",
    alt: "AI-generated fox PNGTuber avatar",
    prompt:
      "orange fox ears, long wavy blue hair with star hairpins, glowing amber eyes, navy blue dress with constellations, holding a floating crystal ball",
  },
  {
    src: "/images/showcase/pinkbunny_pngtuber.png",
    alt: "AI-generated pink bunny PNGTuber avatar",
    prompt:
      "pink bunny ears, floral hair band, soft peach bob hair, emerald green eyes, oversized cream hoodie, holding a basket of strawberries",
  },
  {
    src: "/images/showcase/sunflower_pngtuber.png",
    alt: "AI-generated sunflower PNGTuber avatar",
    prompt:
      "giant sunflower crown, mint green curly hair, bright yellow eyes, white sundress, holding a watering can, tiny yellow wings",
  },
  {
    src: "/images/showcase/round1_idle.png",
    alt: "AI PNGTuber avatar magical girl expression",
    prompt:
      "A classic magical girl with long, flowing golden twin-tails tied with large red silk bows. She has bright blue, expressive eyes and a heart-shaped face. She wears a white sailor-style bodice with a navy blue collar and a large red ribbon pinned to the chest. Her outfit features puffed short sleeves and a pleated mini skirt. She is adorned with small golden star-shaped earrings and a delicate red choker.",
  },
  {
    src: "/images/showcase/round2_sad.png",
    alt: "AI PNGTuber avatar witch expression",
    prompt:
      "small witch, huge wizard hat, starry hair, galaxy eyes, navy blue dress, magical girl",
  },
  {
    src: "/images/showcase/round3_angry.png",
    alt: "AI PNGTuber avatar angry expression",
    prompt:
      "A young woman with voluminous, wavy dark brown hair and large brown eyes. She wears round glasses with silver sun-shaped pendants hanging from the frames. Her attire consists of a black Gothic-style ruffled corset top, a black choker with a silver star charm, and layered silver necklaces featuring a crescent moon pendant. She has a fair complexion and a gentle smile.",
  },
];

export default function AvatarGallery({
  title = "PNGTuber Avatars Created with AI",
  description = "Every avatar below was generated in seconds — no art skills required.",
  avatars = defaultAvatars,
}: {
  title?: string;
  description?: string;
  avatars?: AvatarItem[];
}) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.src}
              className="group relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-200 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <Image
                src={avatar.src}
                alt={avatar.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                <p className="text-white text-xs sm:text-sm leading-snug line-clamp-3 mb-2">
                  <span className="text-primary font-medium">"</span>
                  {avatar.prompt}
                  <span className="text-primary font-medium">"</span>
                </p>
                <Link
                  href={`/create?prompt=${encodeURIComponent(avatar.prompt)}`}
                  className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/80 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Try this prompt
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
