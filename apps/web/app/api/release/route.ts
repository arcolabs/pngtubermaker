const COMMIT_SHA_PATTERN = /^[a-f0-9]{40}$/;

export const dynamic = "force-dynamic";

export function releaseCommitResponse(
  commitSha = process.env.APP_RELEASE_COMMIT_SHA ?? "",
): Response {
  const normalized = commitSha.trim().toLowerCase();
  if (!COMMIT_SHA_PATTERN.test(normalized)) {
    return Response.json(
      { error: "release_commit_unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "X-Release-Commit": normalized,
    },
  });
}

export function GET(): Response {
  return releaseCommitResponse();
}

export function HEAD(): Response {
  return releaseCommitResponse();
}
