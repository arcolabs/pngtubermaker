import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AvatarGenerator } from "@/components/create/AvatarGenerator";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create PNGTuber",
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
