import { ImageResponse } from "next/og";
import { site } from "@/config/site";
export const alt = "Marouane Messafri — Build. Break. Secure.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0b1012",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        color: "#eaf0ed",
      }}
    >
      <div style={{ color: "#78e7d2", fontSize: 22, marginBottom: 40 }}>
        SOFTWARE × SECURITY
      </div>
      <div style={{ fontSize: 78, letterSpacing: -4 }}>
        Build. Break. Secure.
      </div>
      <div style={{ fontSize: 32, marginTop: 40 }}>{site.name}</div>
      <div style={{ fontSize: 22, marginTop: 16, color: "#96a3a7" }}>
        {site.title}
      </div>
    </div>,
    size,
  );
}
