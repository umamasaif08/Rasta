import { getApprovedResources } from "@/lib/resources";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rasta — Plain Text Resource List",
  description: "Low-bandwidth, print-friendly list of free resources in Karachi.",
};

export const revalidate = 300;

const CATEGORY_LABELS: Record<string, string> = {
  shelter: "SHELTER",
  food:    "FOOD",
  clinic:  "CLINIC",
  legal:   "LEGAL AID",
};

export default async function LowBandwidthPage() {
  const resources = await getApprovedResources();

  const byCategory: Record<string, typeof resources> = {};
  for (const r of resources) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  }

  return (
    // Minimal inline styles — intentionally no Tailwind, works on any browser
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px", fontFamily: "Georgia, serif", color: "#111", lineHeight: 1.6 }}>
      <div style={{ borderBottom: "2px solid #111", marginBottom: 24, paddingBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
          RASTA — Free Resources in Karachi
        </h1>
        <p style={{ fontSize: 13, margin: "4px 0 0", color: "#555" }}>
          Plain-text version · Print-friendly · Last updated on load
        </p>
        <p style={{ fontSize: 13, marginTop: 4, color: "#555" }}>
          Full site:{" "}
          <a href="/" style={{ color: "#008585" }}>
            rasta.pk
          </a>
        </p>
      </div>

      {(["shelter", "food", "clinic", "legal"] as const).map((cat) => {
        const list = byCategory[cat];
        if (!list?.length) return null;
        return (
          <section key={cat} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {CATEGORY_LABELS[cat]}
            </h2>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              {list.map((r, i) => (
                <li key={r.id} style={{ marginBottom: 20 }}>
                  <strong>{i + 1}. {r.name}</strong>
                  <br />
                  <span style={{ fontSize: 13, color: "#333" }}>
                    Address: {r.address}
                    <br />
                    Phone: <a href={`tel:${r.phone}`} style={{ color: "#008585" }}>{r.phone}</a>
                    <br />
                    Hours: {r.hours}
                    <br />
                    Languages: {r.languages.join(", ")}
                    {(r.servesWomen || r.servesChildren) && (
                      <>
                        <br />
                        Serves:{" "}
                        {[r.servesWomen && "Women", r.servesChildren && "Children"]
                          .filter(Boolean)
                          .join(", ")}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <div style={{ borderTop: "1px solid #ccc", marginTop: 32, paddingTop: 16, fontSize: 12, color: "#888" }}>
        <p>
          This list is maintained by the organisations themselves and reviewed by
          the Rasta admin team. To report outdated info, visit the full site at{" "}
          <a href="/" style={{ color: "#008585" }}>rasta.pk</a>.
        </p>
      </div>
    </div>
  );
}
