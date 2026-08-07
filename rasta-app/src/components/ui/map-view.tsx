"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ResourceSummary, ResourceCategory } from "@/types";

// Category → marker colour (matches palette)
const CATEGORY_COLOUR: Record<ResourceCategory, string> = {
  shelter: "#008585",   // teal
  food:    "#C7522A",   // terracotta
  clinic:  "#74A892",   // sage
  legal:   "#E5C185",   // sand
};

interface MapViewProps {
  resources: ResourceSummary[];
  /** When set, centres the map on this resource and opens its popup */
  focusId?: string;
  /** Height class — defaults to h-[460px] */
  className?: string;
  zoom?: number;
}

/**
 * Leaflet map loaded dynamically (no SSR).
 * We import Leaflet imperatively inside useEffect so Next.js never tries to
 * run it server-side (Leaflet requires `window`).
 */
export default function MapView({
  resources,
  focusId,
  className = "h-[460px]",
  zoom = 12,
}: MapViewProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<import("leaflet").Map | null>(null);
  const markersRef    = useRef<Map<string, import("leaflet").Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    async function init() {
      const L = (await import("leaflet")).default;

      // Inject Leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link   = document.createElement("link");
        link.id      = "leaflet-css";
        link.rel     = "stylesheet";
        link.href    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isMounted || !containerRef.current) return;

      // Karachi centre
      const karachi: [number, number] = [24.86, 67.01];

      // Create map only once
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: karachi,
          zoom,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
          }
        ).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Build custom coloured icon factory
      function makeIcon(colour: string, size = 28): import("leaflet").DivIcon {
        return L.divIcon({
          className: "",
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
            background:${colour};border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            transform:rotate(-45deg);
          "></div>`,
          iconSize:   [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor:[0, -size],
        });
      }

      // Remove old markers that are no longer in the list
      const currentIds = new Set(resources.map((r) => r.id));
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add / update markers
      resources.forEach((r) => {
        if (!r.lat || !r.lng) return; // skip ungeocoded

        if (!markersRef.current.has(r.id)) {
          const colour = CATEGORY_COLOUR[r.category] ?? "#008585";
          const isFocus = r.id === focusId;
          const icon   = makeIcon(colour, isFocus ? 34 : 28);
          const marker = L.marker([r.lat, r.lng], { icon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:180px;font-family:system-ui,sans-serif">
                <strong style="font-size:13px;line-height:1.4">${r.name}</strong><br/>
                <span style="font-size:11px;color:#4a6060">${r.address}</span><br/>
                <a href="/resources/${r.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:#008585;font-weight:500">
                  View details →
                </a>
              </div>`,
              { maxWidth: 240 }
            );
          markersRef.current.set(r.id, marker);
        }
      });

      // Focus on specific marker
      if (focusId) {
        const m = markersRef.current.get(focusId);
        const r = resources.find((x) => x.id === focusId);
        if (m && r && r.lat && r.lng) {
          map.setView([r.lat, r.lng], 15, { animate: true });
          m.openPopup();
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  // Re-run when resource list or focus changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, focusId]);

  // Destroy map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-teal-light)] ${className}`}
    >
      {/* Map mount point */}
      <div ref={containerRef} className="h-full w-full" aria-label="Map of resources" />

      {/* Attribution sits on top so it's always visible */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(255,255,255,0.7), transparent)",
        }}
      />

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-sm rounded-[8px] px-3 py-2 text-xs shadow border border-[var(--color-teal-light)] space-y-1">
        {(Object.entries(CATEGORY_COLOUR) as [ResourceCategory, string][]).map(([cat, colour]) => (
          <div key={cat} className="flex items-center gap-1.5 capitalize">
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/60 shadow-sm"
              style={{ background: colour }}
            />
            {cat === "legal" ? "Legal Aid" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
