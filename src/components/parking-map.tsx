"use client";

import { useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";

import { Button } from "@/components/ui/button";
import {
  currentAssignmentForSpot,
  toViewportPoint,
  toViewportRect,
  type NormalizedRect,
  type ParkingApron,
  type ParkingAssignment,
  type ParkingSpot,
} from "@/lib/parking";

export function ParkingMap({
  dziUrl,
  aprons,
  spots,
  assignments,
  selectedSpotId,
  onSelectSpot,
}: {
  dziUrl: string;
  aprons: ParkingApron[];
  spots: ParkingSpot[];
  assignments: ParkingAssignment[];
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      tileSources: dziUrl,
      showNavigationControl: true,
      gestureSettingsMouse: { clickToZoom: false },
      gestureSettingsTouch: { clickToZoom: false },
      visibilityRatio: 1,
      minZoomImageRatio: 0.9,
      maxZoomPixelRatio: 4,
    });
    viewerRef.current = viewer;

    viewer.addHandler("open", () => {
      const item = viewer.world.getItemAt(0);
      const size = item?.getContentSize();
      if (size && size.y > 0) setAspectRatio(size.x / size.y);
    });
    viewer.addHandler("open-failed", () => setLoadFailed(true));

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
    // dziUrl is fixed for the lifetime of the page; the viewer isn't
    // rebuilt if it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || aspectRatio === null) return;

    viewer.clearOverlays();

    for (const spot of spots) {
      const assignment = currentAssignmentForSpot(assignments, spot.id);
      const element = document.createElement("button");
      element.type = "button";
      element.className = [
        "flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-0.5 rounded-md border px-1.5 py-1 text-[10px] font-medium whitespace-nowrap shadow-sm transition-colors",
        assignment ? "border-amber-400 bg-amber-950/90 text-amber-100" : "border-white/30 bg-black/70 text-white/70",
        selectedSpotId === spot.id ? "ring-2 ring-sky-400" : "",
      ].join(" ");
      element.innerHTML = assignment
        ? `<span class="parking-plane-icon"></span><span>${assignment.aircraft}</span>`
        : `<span class="parking-plane-icon"></span><span>${spot.label}</span>`;
      element.addEventListener("click", () => onSelectSpot(spot.id));

      const iconHost = element.querySelector(".parking-plane-icon");
      if (iconHost) {
        // Rendered via a tiny inline SVG rather than mounting a React tree,
        // since these elements live outside React once handed to OpenSeadragon.
        iconHost.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
      }

      const point = toViewportPoint(spot, aspectRatio);
      viewer.addOverlay(element, new OpenSeadragon.Point(point.x, point.y), OpenSeadragon.Placement.CENTER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio, spots, assignments, selectedSpotId]);

  function jumpToApron(rect: NormalizedRect) {
    const viewer = viewerRef.current;
    if (!viewer || aspectRatio === null) return;
    const viewportRect = toViewportRect(rect, aspectRatio);
    viewer.viewport.fitBounds(
      new OpenSeadragon.Rect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height),
      false,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => viewerRef.current?.viewport.goHome(false)}>
          Full map
        </Button>
        {aprons.map((apron) => (
          <Button key={apron.id} type="button" variant="outline" size="sm" onClick={() => jumpToApron(apron)}>
            {apron.code}
          </Button>
        ))}
      </div>

      <div className="relative h-[60vh] min-h-96 w-full overflow-hidden rounded-lg border border-[#444] bg-black">
        <div ref={containerRef} className="h-full w-full" />
        {loadFailed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-gray-300">
            Map tiles aren&apos;t available yet. Run scripts/generate-parking-tiles.mjs and
            scripts/upload-parking-tiles.mjs to publish the apron map.
          </div>
        ) : null}
      </div>
    </div>
  );
}
