"use client";
import { useState } from "react";
import { X, Plus, Upload } from "lucide-react";
import type { Field } from "./editor-fields";
export function EditorField({
  field,
  data,
  update,
  upload,
  uploading,
}: {
  field: Field;
  data: Record<string, unknown>;
  update: (key: string, value: unknown) => void;
  upload: (file: File, key: string) => Promise<void>;
  uploading: boolean;
}) {
  const value = data[field.key];
  if (field.type === "checkbox")
    return (
      <label className="checkbox-field" key={field.key}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => update(field.key, e.target.checked)}
        />
        {field.label}
      </label>
    );
  if (field.type === "timeline" || field.type === "references") {
    const rows = (value || []) as Record<string, string>[];
    const keys =
      field.type === "timeline"
        ? ["label", "date", "description"]
        : ["label", "url"];
    const labels: Record<string, string> = {
      label: "Titre",
      date: "Date (facultative)",
      description: "Description",
      url: "URL HTTPS",
    };
    return (
      <fieldset className="editor-repeater" key={field.key}>
        <legend>{field.label}</legend>
        {rows.map((row, i) => (
          <div className="repeater-row" key={i}>
            {keys.map((key) => (
              <label key={key}>
                {labels[key]}
                <input
                  value={row[key]}
                  onChange={(e) =>
                    update(
                      field.key,
                      rows.map((r, index) =>
                        index === i ? { ...r, [key]: e.target.value } : r,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <button
              type="button"
              className="icon-button"
              aria-label={`Retirer l’élément ${i + 1}`}
              onClick={() =>
                update(
                  field.key,
                  rows.filter((_, index) => index !== i),
                )
              }
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          className="small-button"
          type="button"
          onClick={() =>
            update(field.key, [
              ...rows,
              Object.fromEntries(keys.map((k) => [k, ""])),
            ])
          }
        >
          <Plus size={14} />
          Ajouter un élément
        </button>
      </fieldset>
    );
  }
  const control =
    field.type === "textarea" ? (
      <textarea
        rows={3}
        value={String(value || "")}
        onChange={(e) => update(field.key, e.target.value)}
      />
    ) : field.type === "select" ? (
      <select
        value={String(value || "")}
        onChange={(e) => update(field.key, e.target.value)}
      >
        {field.options?.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    ) : field.type === "list" ? (
      <ListInput
        value={value as string[]}
        onChange={(v) => update(field.key, v)}
      />
    ) : (
      <input
        type={field.type === "number" ? "number" : "text"}
        step={field.key.startsWith("cvss") ? ".1" : "1"}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) =>
          update(
            field.key,
            field.type === "number"
              ? e.target.value === ""
                ? null
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
    );
  return (
    <div key={field.key}>
      <label>
        {field.label}
        {control}
        {field.help && <small>{field.help}</small>}
      </label>
      {field.type === "image" && (
        <label className="image-upload">
          <Upload size={14} />
          {uploading ? "Traitement…" : "Importer une image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file, field.key);
            }}
          />
        </label>
      )}
    </div>
  );
}

function ListInput({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}
