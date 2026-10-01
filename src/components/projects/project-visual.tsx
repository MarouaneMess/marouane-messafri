import Image from "next/image";
import {
  ArrowRight,
  Braces,
  Database,
  FileText,
  Fingerprint,
  Folder,
  Link2,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import type { Project } from "@/lib/validation";

function ScanModel() {
  return (
    <div className="product-model scan-model">
      <div className="model-toolbar">
        <span>
          <ScanLine size={17} /> Vulscan
        </span>
        <span className="model-dots">•••</span>
      </div>
      <div className="scan-workspace">
        <div className="model-rail">
          <ScanLine />
          <Folder />
          <Database />
        </div>
        <div className="scan-content">
          <span className="model-overline">DE LA CIBLE À LA COMPRÉHENSION</span>
          <strong>Relier les informations.</strong>
          <div className="scan-steps">
            <span>Cibles</span>
            <ArrowRight />
            <span>Scans</span>
            <ArrowRight />
            <span>Résultats</span>
          </div>
          <div className="scan-graph">
            <svg viewBox="0 0 300 105" preserveAspectRatio="none">
              <path d="M45 53H150M150 53V22H250M150 53V85H250" />
            </svg>
            <div className="graph-node graph-source">
              <Database />
              <small>Résultat</small>
            </div>
            <div className="graph-node graph-port">
              <Braces />
              <small>Port</small>
            </div>
            <div className="graph-node graph-cve">
              <Fingerprint />
              <small>CVE</small>
            </div>
          </div>
        </div>
      </div>
      <div className="model-base">
        <span>React</span>
        <span>Django REST</span>
        <span>PostgreSQL</span>
      </div>
    </div>
  );
}

function LinkModel() {
  return (
    <div className="product-model link-model">
      <div className="model-toolbar">
        <span>
          <Link2 size={17} /> blink<span className="blink-dot">.</span>
        </span>
        <span className="model-dots">•••</span>
      </div>
      <div className="link-content">
        <span className="model-overline">LE CHEMIN LE PLUS COURT</span>
        <strong>
          Less link.
          <br />
          <em>More possibility.</em>
        </strong>
        <div className="long-link">
          https://destination.example/un/long/chemin
        </div>
        <div className="link-transform">
          <span />
          <ArrowRight />
          <span />
        </div>
        <div className="short-link">
          <Link2 size={20} />
          <span>
            blink.example/<b>hello</b>
          </span>
          <ArrowRight size={20} />
        </div>
      </div>
      <div className="model-base">
        <span>Une URL.</span>
        <span>Un raccourci.</span>
        <span>La même destination.</span>
      </div>
    </div>
  );
}

function PortalModel() {
  return (
    <div className="product-model portal-model">
      <div className="model-toolbar">
        <span>
          <LockKeyhole size={17} /> Payslip Portal
        </span>
        <ShieldCheck size={17} />
      </div>
      <div className="portal-content">
        <span className="model-overline">
          UN DOCUMENT. LE BON DESTINATAIRE.
        </span>
        <div className="document-stack">
          <div />
          <div />
          <div className="document-front">
            <FileText size={30} />
            <strong>Fiche de paie</strong>
            <i />
            <i />
            <i />
            <span>
              <LockKeyhole size={13} /> Espace personnel
            </span>
          </div>
        </div>
        <div className="portal-flow">
          <span>Gestion</span>
          <span className="portal-lock">
            <LockKeyhole size={16} />
          </span>
          <span>Salarié</span>
        </div>
      </div>
    </div>
  );
}

export function ProjectVisual({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const variant =
    project.slug === "vulscan"
      ? "scan"
      : project.slug === "blink"
        ? "link"
        : project.slug.includes("payslip")
          ? "portal"
          : project.slug.includes("pain")
            ? "bread"
            : "code";
  const Icon = variant === "bread" ? Wheat : Braces;
  return (
    <div
      className={`project-visual visual-${variant}${large ? " visual-large" : ""}${project.coverImage ? " visual-image" : ""}`}
    >
      {project.coverImage ? (
        <Image
          src={project.coverImage}
          fill
          sizes={
            large
              ? "(max-width: 768px) 100vw, 1184px"
              : "(max-width: 768px) 100vw, 600px"
          }
          alt={`Aperçu du projet ${project.title}`}
        />
      ) : (
        <>
          <div className="visual-orbit" aria-hidden="true" />
          <div className="visual-coordinate mono" aria-hidden="true">
            {variant === "scan"
              ? "01 / CONNECT THE DOTS"
              : variant === "link"
                ? "02 / SIMPLIFY THE PATH"
                : variant === "portal"
                  ? "03 / DESIGNED FOR TRUST"
                  : "DESIGN × ENGINEERING"}
          </div>
          <div className="visual-scene" aria-hidden="true">
            {variant === "scan" ? (
              <ScanModel />
            ) : variant === "link" ? (
              <LinkModel />
            ) : variant === "portal" ? (
              <PortalModel />
            ) : (
              <div className="product-model generic-model">
                <Icon size={62} strokeWidth={1} />
                <strong>{project.title}</strong>
              </div>
            )}
          </div>
          <span className="visual-caption mono">
            Illustration conceptuelle<span aria-hidden="true">↗</span>
          </span>
        </>
      )}
    </div>
  );
}
