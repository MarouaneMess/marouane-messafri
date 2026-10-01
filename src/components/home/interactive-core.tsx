"use client";
import { useEffect, useRef, useState } from "react";
import {
  Code2,
  Fingerprint,
  ShieldCheck,
  MoveUpRight,
  Pause,
  Play,
} from "lucide-react";
import type { CoreMode, createCoreScene } from "@/lib/visual/core-scene";
import { Architecture } from "./architecture";
const perspectives = [
  {
    id: "build" as const,
    number: "01",
    label: "Build",
    icon: Code2,
    subtitle: "De l’idée à l’architecture.",
    description:
      "Assembler les bonnes pièces. Créer une expérience qui fonctionne.",
  },
  {
    id: "break" as const,
    number: "02",
    label: "Break",
    icon: Fingerprint,
    subtitle: "Changer de perspective.",
    description:
      "Décomposer le système. Comprendre ses limites et ses points de rupture.",
  },
  {
    id: "secure" as const,
    number: "03",
    label: "Secure",
    icon: ShieldCheck,
    subtitle: "La confiance se construit.",
    description: "Renforcer les fondations. Protéger ce qui compte.",
  },
];
export function InteractiveCore() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createCoreScene> | null>(null);
  const [mode, setMode] = useState<CoreMode>("build");
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const active = perspectives.find((p) => p.id === mode)!;
  useEffect(() => {
    let cancelled = false;
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        void import("@/lib/visual/core-scene")
          .then(({ createCoreScene }) => {
            if (cancelled) return;
            try {
              controller.current = createCoreScene(element, () =>
                setReady(true),
              );
            } catch {
              setReady(false);
            }
          })
          .catch(() => {
            if (!cancelled) setReady(false);
          });
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    controller.current?.setMode(mode);
  }, [mode, ready]);
  function select(value: CoreMode) {
    setMode(value);
  }
  return (
    <div className="interactive-core" data-mode={mode} data-ready={ready}>
      <div className="core-stage">
        <div className="core-aura" />
        <div className="core-grid" />
        <div className="core-stage-top mono">
          <span>
            <i className="status-dot" /> THREE WAYS TO THINK
          </span>
          <span>VOL. 01 / {active.number}</span>
        </div>
        <div
          className="core-canvas"
          ref={host}
          role="img"
          aria-label={`Sculpture 3D interactive : ${active.label}. ${active.description}`}
        />
        {!ready && (
          <div className="core-fallback">
            <Architecture />
          </div>
        )}
        <div className="core-callout callout-primary">
          <active.icon size={19} strokeWidth={1.3} />
          <div>
            <small className="mono">{active.number} / PERSPECTIVE</small>
            <strong>
              {active.label}
              <MoveUpRight size={14} />
            </strong>
          </div>
        </div>
        <div className="core-signature mono">
          <span>&lt; / &gt;</span> SAME CORE.
          <br />
          DIFFERENT PERSPECTIVES.
        </div>
        {ready && (
          <button
            className="core-pause"
            aria-label={
              paused
                ? "Reprendre l’animation 3D"
                : "Mettre l’animation 3D en pause"
            }
            onClick={() => {
              setPaused(!paused);
              controller.current?.setPaused(!paused);
            }}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        )}
        <span className="core-corner corner-tl" />
        <span className="core-corner corner-br" />
      </div>
      <div
        className="perspective-switch"
        aria-label="Perspectives interactives"
      >
        {perspectives.map((p) => (
          <button
            key={p.id}
            className={mode === p.id ? "selected" : ""}
            aria-pressed={mode === p.id}
            onClick={() => select(p.id)}
          >
            <span className="mono">{p.number}</span>
            <p.icon size={16} />
            {p.label}
          </button>
        ))}
      </div>
      <div className="perspective-caption" aria-live="polite">
        <strong>{active.subtitle}</strong>
        <p>{active.description}</p>
      </div>
    </div>
  );
}
