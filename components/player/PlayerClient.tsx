"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
        if (event.error === "Microphone access denied") {
          setState("mic-denied");
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

        const engine = new PNGTuberEngine({
          canvas: canvasEl,
          expressions,
          mode: "mic",
          proxyBaseUrl: "/api/proxy-image/public?url=",
          ...(threshold ? { micThreshold: Number(threshold) } : {}),
          ...(bounce !== null ? { bounceOnChange: bounce !== "false" } : {}),
          ...(bounceDuration ? { bounceDuration: Number(bounceDuration) } : {}),
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

      {/* Mic denied message */}
      {state === "mic-denied" && (
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
              fontSize: "1.25rem",
              textAlign: "center",
              padding: "1rem",
              maxWidth: "400px",
            }}
          >
            Microphone access is required for the PNGTuber player.
            <br />
            <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>
              In OBS: right-click the Browser Source &rarr; Properties &rarr;
              check &quot;Control audio via OBS&quot;
            </span>
          </p>
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
