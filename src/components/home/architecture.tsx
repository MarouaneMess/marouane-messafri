import {
  Code2,
  Fingerprint,
  ShieldCheck,
  Braces,
  ArrowDownRight,
} from "lucide-react";
export function Architecture() {
  return (
    <div
      className="architecture"
      role="img"
      aria-label="Build, Break, Secure : du développement à la recherche et à la protection des applications."
    >
      <div className="arch-top mono">
        <span>
          <i className="status-dot" /> SYSTEM THINKING
        </span>
        <span>FIG. 001</span>
      </div>
      <div className="arch-orbit orbit-one" />
      <div className="arch-orbit orbit-two" />
      <div className="arch-axis axis-x" />
      <div className="arch-axis axis-y" />
      <svg className="arch-connectors" viewBox="0 0 480 390" aria-hidden="true">
        <path
          d="M240 90 L360 238 L150 290 Z"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 6"
        />
        <path
          d="M240 90 V220 L150 290 M240 220 L360 238"
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <div className="arch-core">
        <Braces size={40} strokeWidth={1} />
        <span className="mono">c0fff33</span>
      </div>
      <div className="arch-node node-build">
        <Code2 />
        <div>
          <small>01 / ENGINEER</small>
          <strong>Build</strong>
        </div>
        <span className="node-indicator" />
      </div>
      <div className="arch-node node-break">
        <Fingerprint />
        <div>
          <small>02 / UNDERSTAND</small>
          <strong>Break</strong>
        </div>
        <span className="node-indicator" />
      </div>
      <div className="arch-node node-secure">
        <ShieldCheck />
        <div>
          <small>03 / STRENGTHEN</small>
          <strong>Secure</strong>
        </div>
        <span className="node-indicator" />
      </div>
      <div className="arch-coordinate mono">
        48° / LOGIC
        <br />
        02° / CURIOSITY
      </div>
      <div className="arch-bottom mono">
        <span>
          THE SAME SYSTEM.
          <br />
          THREE PERSPECTIVES.
        </span>
        <ArrowDownRight size={25} strokeWidth={1} />
      </div>
    </div>
  );
}
