import { describe, expect, it } from "bun:test";

import { releaseCommitResponse } from "./route";

describe("release commit readback", () => {
  it("returns the exact normalized deployment commit without a response body", async () => {
    const response = releaseCommitResponse(
      "A1B2C3D4E5F60718293A4B5C6D7E8F9012345678",
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("x-release-commit")).toBe(
      "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("");
  });

  it("fails closed when the build does not expose an exact commit", async () => {
    const response = releaseCommitResponse("dev");

    expect(response.status).toBe(503);
    expect(response.headers.has("x-release-commit")).toBe(false);
    expect(await response.json()).toEqual({
      error: "release_commit_unavailable",
    });
  });
});
