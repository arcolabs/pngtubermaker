import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
  return auth.handler(request);
};

export const POST = async (request: NextRequest) => {
  return auth.handler(request);
};
