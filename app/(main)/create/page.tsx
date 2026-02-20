import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AvatarGenerator } from "@/components/create/AvatarGenerator";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Create PNGTuber | PNGTuberMaker",
  description:
    "Create your PNGTuber avatar with AI. Describe your character, choose a design, and generate expression packs in minutes.",
};

export default async function CreatePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  return <AvatarGenerator />;
}
