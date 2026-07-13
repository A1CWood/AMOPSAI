"use client";

import { useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createApron, createSpot, deleteApron, deleteSpot } from "@/app/(app)/parking/actions";
import {
  currentAssignmentForSpot,
  fromViewportPoint,
  toViewportPoint,
  toViewportRect,
  type NormalizedPoint,
  type NormalizedRect,
  type ParkingApron,
  type ParkingAssignment,
  type ParkingSpot,
} from "@/lib/parking";

type EditMode = "off" | "apron" | "spot";

export function ParkingMap({
  dziUrl,
  aprons,
  spots,
  assignments,
  selectedSpotId,
  onSelectSpot,
  isEditor,
}: {
  dziUrl: string;
  aprons: ParkingApron[];
  spots: ParkingSpot[];
  assignments: ParkingAssignment[];
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
  isEditor: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>("off");
  const [pendingCorner, setPendingCorner] = useState<NormalizedPoint | null>(null);
  const [spotApronId, setSpotApronId] = useState<string | null>(null);

  // handleCanvasClick is registered once (see the mount effect below) but
  // needs the latest editMode/pendingCorner/spotApronId/aprons/spots on
  // every click - keep them in a ref so the handler always reads fresh
  // values without needing to be re-registered on every render.
  const stateRef = useRef({ editMode, pendingCorner, spotApronId, aspectRatio, aprons, spots });
  useEffect(() => {
    stateRef.current = { editMode, pendingCorner, spotApronId, aspectRatio, aprons, spots };
  });

  async function handleCanvasClick(event: OpenSeadragon.CanvasClickEvent) {
    const { editMode, pendingCorner, spotApronId, aspectRatio, aprons, spots } = stateRef.current;
    const viewer = viewerRef.current;
    if (!event.quick || editMode === "off" || !viewer || aspectRatio === null) return;

    const viewportPoint = viewer.viewport.pointFromPixel(event.position);
    const point = fromViewportPoint({ x: viewportPoint.x, y: viewportPoint.y }, aspectRatio);

    if (editMode === "apron") {
      if (!pendingCorner) {
        setPendingCorner(point);
        return;
      }
      const rect: NormalizedRect = {
        x: Math.min(pendingCorner.x, point.x),
        y: Math.min(pendingCorner.y, point.y),
        width: Math.abs(point.x - pendingCorner.x),
        height: Math.abs(point.y - pendingCorner.y),
      };
      setPendingCorner(null);

      const code = window.prompt("Apron code (short, e.g. A):")?.trim();
      if (!code) return;
      const label = window.prompt("Apron label (display name):", `Apron ${code}`)?.trim();
      if (!label) return;

      const formData = new FormData();
      formData.set("code", code);
      formData.set("label", label);
      formData.set("x", String(rect.x));
      formData.set("y", String(rect.y));
      formData.set("width", String(rect.width));
      formData.set("height", String(rect.height));
      try {
        const created = await createApron(formData);
        toast.success(`Apron ${code} created`);
        if (created?.id && window.confirm("Start adding spots to this apron now?")) {
          setSpotApronId(created.id);
          setEditMode("spot");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create apron");
      }
      return;
    }

    if (editMode === "spot") {
      if (!spotApronId) {
        toast.error("Select an apron first.");
        return;
      }
      const apron = aprons.find((a) => a.id === spotApronId);
      const existingCount = spots.filter((s) => s.apron_id === spotApronId).length;
      const suggested = apron ? `${apron.code}${existingCount + 1}` : "";
      const label = window.prompt("Spot label:", suggested)?.trim();
      if (!label) return;

      const formData = new FormData();
      formData.set("apronId", spotApronId);
      formData.set("label", label);
      formData.set("x", String(point.x));
      formData.set("y", String(point.y));
      try {
        await createSpot(formData);
        toast.success(`Spot ${label} added`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add spot");
      }
    }
  }

  async function handleDeleteApron(apron: ParkingApron) {
    if (!window.confirm(`Delete apron ${apron.code} and all its spots?`)) return;
    const formData = new FormData();
    formData.set("id", apron.id);
    try {
      await deleteApron(formData);
      toast.success(`Apron ${apron.code} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete apron");
    }
  }

  async function handleDeleteSpot(spot: ParkingSpot) {
    if (!window.confirm(`Delete spot ${spot.label}?`)) return;
    const formData = new FormData();
    formData.set("id", spot.id);
    try {
      await deleteSpot(formData);
      toast.success(`Spot ${spot.label} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete spot");
    }
  }

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
    viewer.addHandler("canvas-click", (event) => void handleCanvasClick(event));

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
    // dziUrl is fixed for the lifetime of the page; the viewer isn't
    // rebuilt if it changes. handleCanvasClick reads current state via
    // stateRef, so it doesn't need to be in the dependency array.
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
      element.addEventListener("click", () => {
        if (stateRef.current.editMode !== "off") {
          void handleDeleteSpot(spot);
          return;
        }
        onSelectSpot(spot.id);
      });

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

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || aspectRatio === null || !pendingCorner) return;

    const element = document.createElement("div");
    element.className = "size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 ring-2 ring-white";
    const point = toViewportPoint(pendingCorner, aspectRatio);
    viewer.addOverlay(element, new OpenSeadragon.Point(point.x, point.y), OpenSeadragon.Placement.CENTER);

    return () => {
      viewer.removeOverlay(element);
    };
  }, [pendingCorner, aspectRatio]);

  function jumpToApron(rect: NormalizedRect) {
    const viewer = viewerRef.current;
    if (!viewer || aspectRatio === null) return;
    const viewportRect = toViewportRect(rect, aspectRatio);
    viewer.viewport.fitBounds(
      new OpenSeadragon.Rect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height),
      false,
    );
  }

  function stopEditing() {
    setEditMode("off");
    setPendingCorner(null);
  }

  function toggleApronMode() {
    if (editMode === "apron") {
      stopEditing();
    } else {
      setEditMode("apron");
      setPendingCorner(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => viewerRef.current?.viewport.goHome(false)}>
          Full map
        </Button>
        {aprons.map((apron) => (
          <div key={apron.id} className="flex items-center gap-0.5">
            <Button type="button" variant="outline" size="sm" onClick={() => jumpToApron(apron)}>
              {apron.code}
            </Button>
            {editMode !== "off" ? (
              <button
                type="button"
                className="text-xs text-destructive"
                aria-label={`Delete apron ${apron.code}`}
                onClick={() => void handleDeleteApron(apron)}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {isEditor ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#444] bg-[#1a1a1a] p-2 text-sm text-white">
          <Button
            type="button"
            size="sm"
            variant={editMode === "apron" ? "default" : "outline"}
            onClick={toggleApronMode}
          >
            {editMode === "apron" ? (pendingCorner ? "Click 2nd corner…" : "Click 1st corner…") : "Draw apron"}
          </Button>

          <select
            className="h-9 rounded-md border border-[#555] bg-white px-2 text-black"
            value={spotApronId ?? ""}
            onChange={(event) => setSpotApronId(event.target.value || null)}
          >
            <option value="">Select apron…</option>
            {aprons.map((apron) => (
              <option key={apron.id} value={apron.id}>
                {apron.code} — {apron.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant={editMode === "spot" ? "default" : "outline"}
            disabled={!spotApronId}
            onClick={() => (editMode === "spot" ? stopEditing() : setEditMode("spot"))}
          >
            {editMode === "spot" ? "Click to place spot…" : "Add spots"}
          </Button>

          {editMode !== "off" ? (
            <Button type="button" size="sm" variant="ghost" onClick={stopEditing}>
              Done
            </Button>
          ) : (
            <span className="text-xs text-gray-400">
              While a tool above is active, clicking an existing marker deletes it instead of placing a new one.
            </span>
          )}
        </div>
      ) : null}

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
