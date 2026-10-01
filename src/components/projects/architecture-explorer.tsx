"use client";
import { useId, useState } from "react";
import { ArrowDown, Database, PanelsTopLeft, Workflow } from "lucide-react";

const layers = [
  {
    name: "Interface",
    technology: "React",
    icon: PanelsTopLeft,
    title: "Explorer les informations.",
    text: "L’interface présente les cibles, les scans et leurs résultats. Elle permet de parcourir les informations centralisées par l’application.",
    entities: ["Cibles", "Scans", "Résultats"],
  },
  {
    name: "API & logique",
    technology: "Django · Django REST Framework",
    icon: Workflow,
    title: "Relier les entités métier.",
    text: "Le backend relie les utilisateurs, les configurations de scan, les cibles et les résultats. L’API fait le lien entre l’interface et ces données.",
    entities: ["User", "ConfigurationScan", "Cible", "Scan", "ResultatScan"],
  },
  {
    name: "Données",
    technology: "PostgreSQL",
    icon: Database,
    title: "Conserver les relations utiles.",
    text: "Le modèle de données organise les résultats et leurs relations avec les ports et les vulnérabilités CVE. Ces liens donnent du contexte aux informations collectées.",
    entities: ["ResultatScan", "Port", "VulnCVE"],
  },
];

export function ArchitectureExplorer() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const current = layers[selected];
  return (
    <div className="architecture-explorer">
      <div
        className="architecture-layers"
        role="group"
        aria-label="Explorer les couches de Vulscan"
      >
        {layers.map((layer, index) => (
          <div key={layer.name}>
            <button
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              aria-controls={id}
            >
              <layer.icon size={22} />
              <span>
                <strong>{layer.name}</strong>
                <small>{layer.technology}</small>
              </span>
              <span className="mono">0{index + 1}</span>
            </button>
            {index < layers.length - 1 && (
              <ArrowDown
                size={17}
                className="layer-connector"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
      <div
        className="architecture-explanation"
        id={id}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="eyebrow">VUE D’ENSEMBLE / 0{selected + 1}</span>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="architecture-entities">
          {current.entities.map((entity) => (
            <span key={entity}>{entity}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
