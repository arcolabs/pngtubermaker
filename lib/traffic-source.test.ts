import { describe, expect, test } from "bun:test";
import { getTrafficSourceMetadata } from "@/lib/traffic-source";

describe("getTrafficSourceMetadata", () => {
  test("maps tracking cookies into Stripe metadata fields", () => {
    expect(
      getTrafficSourceMetadata({
        _ts_vid: "visitor_123",
        _ts_sid: "session_456",
      }),
    ).toEqual({
      ts_session_id: "session_456",
      ts_visitor_id: "visitor_123",
    });
  });

  test("falls back to empty strings when tracking cookies are missing", () => {
    expect(getTrafficSourceMetadata({})).toEqual({
      ts_session_id: "",
      ts_visitor_id: "",
    });
  });
});
