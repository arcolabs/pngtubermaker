"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type EngineEvent,
  type EngineExpressionType,
  type ExpressionAsset,
  PNGTuberEngine,
} from "@/lib/pngtuber-engine";

interface PlayerClientProps {
  avatarId: string;
}

type PlayerState = "loading" | "ready" | "error" | "mic-denied";

export default function PlayerClient({ avatarId }: PlayerClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PNGTuberEngine | null>(null);
  const searchParams = useSearchParams();

  const [state, setState] = useState<PlayerState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [platformTab, setPlatformTab] = useState<"windows" | "mac">("windows");

  const isOBS = useMemo(
    () =>
      typeof navigator !== "undefined" && /OBS\//i.test(navigator.userAgent),
    [],
  );

  // Make background transparent for OBS Browser Source
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
    };
  }, []);

  const handleEvent = useCallback((event: EngineEvent) => {
    switch (event.type) {
      case "ready":
        setState("ready");
        break;
      case "error":
        if (event.error?.startsWith("Microphone access denied")) {
          setState("mic-denied");
          setErrorMsg(event.error);
        } else {
          setState("error");
          setErrorMsg(event.error ?? "Unknown error");
        }
        break;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;
    const canvasEl = canvas;

    async function init() {
      try {
        const res = await fetch(`/api/avatars/${avatarId}/public`);
        if (!res.ok) {
          setState("error");
          setErrorMsg(
            res.status === 404
              ? "Avatar not found"
              : "Failed to load avatar data",
          );
          return;
        }

        const data = await res.json();

        if (destroyed) return;

        const expressions: ExpressionAsset[] = data.expressions.map(
          (e: { type: string; url: string }) => ({
            type: e.type as EngineExpressionType,
            url: e.url,
          }),
        );

        if (expressions.length < 2) {
          setState("error");
          setErrorMsg("Avatar has insufficient expressions for playback");
          return;
        }

        // Read optional URL params
        const threshold = searchParams.get("threshold");
        const bounce = searchParams.get("bounce");
        const bounceDuration = searchParams.get("bounceDuration");
        const calibrate = searchParams.get("calibrate");
        const delay = searchParams.get("delay");

        const engine = new PNGTuberEngine({
          canvas: canvasEl,
          expressions,
          mode: "mic",
          proxyBaseUrl: "/api/proxy-image/public?url=",
          ...(threshold ? { micThreshold: Number(threshold) } : {}),
          ...(bounce !== null ? { bounceOnChange: bounce !== "false" } : {}),
          ...(bounceDuration ? { bounceDuration: Number(bounceDuration) } : {}),
          ...(calibrate === "false" ? { disableCalibration: true } : {}),
          ...(delay ? { speakingHoldMs: Number(delay) } : {}),
        });

        engine.on(handleEvent);
        engineRef.current = engine;
        engine.start();
      } catch {
        if (!destroyed) {
          setState("error");
          setErrorMsg("Failed to initialize player");
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [avatarId, searchParams, handleEvent]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "transparent",
        }}
      />

      {/* Loading spinner */}
      {state === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Mic denied overlay */}
      {state === "mic-denied" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              color: "#fff",
              padding: "1.5rem",
              maxWidth: "420px",
              width: "90%",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Microphone access required
            </p>

            {isOBS ? (
              <>
                <p
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.8,
                    lineHeight: 1.5,
                    marginBottom: "0.75rem",
                  }}
                >
                  OBS Browser Source blocks mic access by default. Add a launch
                  parameter to fix this:
                </p>

                {/* Platform tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {(["windows", "mac"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPlatformTab(tab)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: platformTab === tab ? 600 : 400,
                        background:
                          platformTab === tab
                            ? "rgba(6,182,212,0.9)"
                            : "rgba(255,255,255,0.15)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      {tab === "windows" ? "Windows" : "Mac"}
                    </button>
                  ))}
                </div>

                {/* Platform-specific instructions */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                    marginBottom: "0.75rem",
                  }}
                >
                  {platformTab === "windows" ? (
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "1.25rem",
                        listStyleType: "decimal",
                      }}
                    >
                      <li>Close OBS</li>
                      <li>Right-click OBS shortcut &rarr; Properties</li>
                      <li>
                        In <strong>Target</strong>, add to the very end:{" "}
                        <code
                          style={{
                            background: "rgba(6,182,212,0.3)",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.7rem",
                          }}
                        >
                          --enable-media-stream
                        </code>
                      </li>
                      <li>Click OK &rarr; Relaunch OBS</li>
                    </ol>
                  ) : (
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "1.25rem",
                        listStyleType: "decimal",
                      }}
                    >
                      <li>Close OBS</li>
                      <li>Open Terminal and run:</li>
                      <li
                        style={{
                          listStyleType: "none",
                          marginLeft: "-1.25rem",
                        }}
                      >
                        <code
                          style={{
                            display: "block",
                            background: "rgba(6,182,212,0.3)",
                            padding: "0.35rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.7rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          open -a OBS --args --enable-media-stream
                        </code>
                      </li>
                    </ol>
                  )}
                </div>

                {/* Veadotube alternative */}
                <p
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.6,
                    lineHeight: 1.5,
                    marginBottom: "0.75rem",
                  }}
                >
                  Too complex? Use <strong>veadotube mini</strong> instead
                  &mdash; download your expressions from the avatar page and
                  import them. No launch parameters needed.
                </p>
              </>
            ) : (
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  lineHeight: 1.5,
                  marginBottom: "0.75rem",
                }}
              >
                Your browser blocked microphone access. Click the lock/camera
                icon in the address bar, allow microphone, then click Retry.
              </p>
            )}

            {/* Retry button */}
            <button
              type="button"
              onClick={() => {
                const engine = engineRef.current;
                if (engine) {
                  setState("loading");
                  engine.setMode("mic");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "rgba(6,182,212,0.9)",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Retry Microphone
            </button>

            {errorMsg && (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.6rem",
                  opacity: 0.35,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {state === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: "1.125rem",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            {errorMsg}
          </p>
        </div>
      )}
    </div>
  );
}
