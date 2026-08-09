type TrackingCookies = Partial<Record<"_ts_vid" | "_ts_sid", string>>;

export function getTrafficSourceMetadata(
  cookies: TrackingCookies,
): Record<string, string> {
  return {
    ts_visitor_id: cookies._ts_vid || "",
    ts_session_id: cookies._ts_sid || "",
  };
}
