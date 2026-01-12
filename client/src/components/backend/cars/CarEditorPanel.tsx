import { useEffect, useMemo, useState } from "react";
import type { Car, CarChips, CarSpecs, CarUpsertPayload, OverviewBlock } from "../../../types/admin.car.types";
import { adminUploadCarImages } from "./adminCars";
import { BasicsSection, SpecsSection, OverviewBlocksSection, ImagesSection } from "./EditorSections";
import { cn, publicAssetUrl, Toggle } from "../../ui/CarEditorUI";

type Props = {
  car: Car | null;
  mode?: "create" | "edit";
  variant?: "panel" | "page";
  onClose: () => void;
  onSave: (payload: CarUpsertPayload, id?: string) => Promise<Car>;
  afterChange?: () => void;
};

export default function CarEditorPanel({ car, mode, variant = "panel", onClose, onSave, afterChange }: Props) {
  const isPanel = variant === "panel";
  const isEdit = Boolean(car?._id) && (mode ?? "edit") === "edit";

  const initial = useMemo<CarUpsertPayload>(() => {
    if (!car)
      return {
        isActive: true,
        isFeatured: false,
        currency: "EUR",
        chips: {},
        specs: {},
        overviewBlocks: [],
      };

    const { _id, ...rest } = car as any;

    const chips: CarChips = { ...(rest.chips || {}) };
    const specs: CarSpecs = { ...(rest.specs || {}) };
    const overviewBlocks: OverviewBlock[] = Array.isArray(rest.overviewBlocks)
      ? rest.overviewBlocks.map((b: any) => ({
          title: String(b?.title || ""),
          text: String(b?.text || ""),
        }))
      : [];

    const seats = typeof rest.seats === "number" ? rest.seats : typeof chips.seats === "number" ? chips.seats : undefined;

    if (typeof seats === "number") {
      rest.seats = seats;
      chips.seats = seats;
    }

    rest.chips = chips;
    rest.specs = specs;
    rest.overviewBlocks = overviewBlocks;

    return { ...rest };
  }, [car]);

  const [payload, setPayload] = useState<CarUpsertPayload>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [savedCar, setSavedCar] = useState<Car | null>(car);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setErr("");
    setPayload(initial);
    setSavedCar(car);
    setFiles([]);
  }, [initial, car]);

  const updateChips = (patch: Partial<CarChips>) => {
    setPayload((p) => ({ ...p, chips: { ...(p.chips || {}), ...patch } }));
  };

  const updateSpecs = (patch: Partial<CarSpecs>) => {
    setPayload((p) => ({ ...p, specs: { ...(p.specs || {}), ...patch } }));
  };

  const blocks: OverviewBlock[] = Array.isArray(payload.overviewBlocks) ? payload.overviewBlocks : [];
  const setBlocks = (next: OverviewBlock[]) => setPayload((p) => ({ ...p, overviewBlocks: next }));

  const currentImages = useMemo(() => {
    const out: Array<{ url: string; alt?: string }> = [];
    const thumb = (savedCar as any)?.thumbnailUrl;
    if (thumb) out.push({ url: String(thumb), alt: "Thumbnail" });

    const g = (savedCar as any)?.gallery;
    if (Array.isArray(g)) {
      for (const item of g) {
        const url = item?.url;
        if (!url) continue;
        out.push({ url: String(url), alt: item?.alt ? String(item.alt) : "" });
      }
    }

    const seen = new Set<string>();
    const dedup = out.filter((x) => {
      if (!x.url) return false;
      if (seen.has(x.url)) return false;
      seen.add(x.url);
      return true;
    });

    return dedup.map((x) => ({ ...x, url: publicAssetUrl(x.url) }));
  }, [savedCar]);

  async function handleSave() {
    setSaving(true);
    setErr("");
    try {
      if (!payload.slug || String(payload.slug).trim().length < 2) {
        throw new Error("Slug is required (min 2 chars)");
      }

      const cleanedBlocks = blocks
        .map((b) => ({ title: String(b?.title || "").trim(), text: String(b?.text || "").trim() }))
        .filter((b) => b.title || b.text);

      const cleaned: CarUpsertPayload = {
        ...payload,
        overviewBlocks: cleanedBlocks,
      };

      const res = await onSave(cleaned, car?._id);
      setSavedCar(res);
      afterChange?.();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Save failed";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload() {
    if (!savedCar?._id || !files.length) return;
    setUploading(true);
    setErr("");
    try {
      const updated = await adminUploadCarImages(savedCar._id, files);
      setSavedCar(updated);
      setFiles([]);
      afterChange?.();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        isPanel
          ? "h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl"
          : "w-full"
      )}
    >
      {isPanel ? (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <div className="text-lg font-semibold text-white">{isEdit ? "Edit car" : "Create new car"}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
          >
            Close
          </button>
        </div>
      ) : null}

      <div className={cn(isPanel ? "max-h-[calc(100vh-170px)] overflow-y-auto p-4" : "p-0 pb-24")}>
        {err ? (
          <div
            className={cn(
              isPanel ? "mb-4" : "mb-4 rounded-2xl",
              "rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
            )}
          >
            {err}
          </div>
        ) : null}

        <div className={cn("grid gap-3", isPanel ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12")}>
          <div className={cn("grid gap-3", isPanel ? "grid-cols-1" : "lg:col-span-8")}>
            <BasicsSection payload={payload} setPayload={setPayload} updateChips={updateChips} />
            <SpecsSection specs={payload.specs || {}} onChange={updateSpecs} />
            <OverviewBlocksSection blocks={blocks} setBlocks={setBlocks} />
          </div>

          <div className={cn("grid gap-3", isPanel ? "grid-cols-1" : "lg:col-span-4")}>
            <ImagesSection
              savedCar={savedCar}
              images={currentImages}
              files={files}
              setFiles={setFiles}
              uploading={uploading}
              onUpload={handleUpload}
            />
          </div>
        </div>
      </div>

      {/* footer actions */}
      <div
        className={cn(
          isPanel
            ? "border-t border-white/10 bg-[#0b0b0b]/95 p-3 backdrop-blur"
            : "sticky bottom-4 z-10 mt-4 rounded-3xl border border-white/10 bg-[#0b0b0b]/90 p-3 backdrop-blur"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            label="Active"
            value={Boolean(payload.isActive)}
            onChange={(v) => setPayload((p) => ({ ...p, isActive: v }))}
          />
          <Toggle
            label="Featured"
            value={Boolean(payload.isFeatured)}
            onChange={(v) => setPayload((p) => ({ ...p, isFeatured: v }))}
          />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "rounded-xl border px-4 py-2 text-xs",
                "border-white/10 bg-white/10 text-white hover:bg-white/15",
                saving && "opacity-60 cursor-not-allowed"
              )}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setPayload(initial);
                setErr("");
              }}
              className="rounded-xl border border-white/10 bg-white/0 px-4 py-2 text-xs text-white/80 hover:bg-white/5"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
