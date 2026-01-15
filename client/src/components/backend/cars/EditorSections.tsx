import type { Dispatch, SetStateAction } from "react";
import type { Car, CarChips, CarSpecs, CarUpsertPayload, OverviewBlock } from "../../../types/admin.car.types";
import { cn, inputCls, IntegerField, NumberField, SectionCard, TextField } from "../../ui/CarEditorUI";
import { AssetImage } from "../../ui/AssetImage";

export function BasicsSection({
  payload,
  setPayload,
  updateChips,
}: {
  payload: CarUpsertPayload;
  setPayload: Dispatch<SetStateAction<CarUpsertPayload>>;
  updateChips: (patch: Partial<CarChips>) => void;
}) {
  return (
    <SectionCard title="Basics">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextField
          label="Make"
          value={String(payload.make || "")}
          placeholder="Lamborghini"
          onChange={(v) => setPayload((p) => ({ ...p, make: v }))}
        />
        <TextField
          label="Model"
          value={String(payload.model || "")}
          placeholder="Urus"
          onChange={(v) => setPayload((p) => ({ ...p, model: v }))}
        />
        <TextField
          label="Trim"
          value={String(payload.trim || "")}
          placeholder="Performante"
          onChange={(v) => setPayload((p) => ({ ...p, trim: v }))}
        />
        <div>
          <TextField
            label="Slug *"
            value={String(payload.slug || "")}
            placeholder="lamborghini-urus"
            onChange={(v) => setPayload((p) => ({ ...p, slug: v }))}
          />
        </div>

        <TextField
          label="Type"
          value={String(payload.type || "")}
          placeholder="SUV / Coupe / Sedan"
          onChange={(v) => setPayload((p) => ({ ...p, type: v }))}
        />

        <IntegerField
          label="Seats"
          value={payload.seats}
          placeholder="4"
          onChangeValue={(v) =>
            setPayload((p) => ({
              ...p,
              seats: v,
              chips: { ...(p.chips || {}), seats: v },
            }))
          }
        />

        <IntegerField
          label="Horsepower (hp)"
          value={payload.chips?.horsepower}
          placeholder="650"
          onChangeValue={(v) => updateChips({ horsepower: v })}
        />

        <TextField
          label="Transmission"
          value={String(payload.chips?.transmission || "")}
          placeholder="Automatic"
          onChange={(v) => updateChips({ transmission: v || undefined })}
        />

        <TextField
          label="Fuel"
          value={String(payload.chips?.fuel || "")}
          placeholder="Petrol"
          onChange={(v) => updateChips({ fuel: v || undefined })}
        />

        <IntegerField
          label="Price per day"
          value={payload.pricePerDay}
          placeholder="1200"
          onChangeValue={(v) => setPayload((p) => ({ ...p, pricePerDay: v }))}
        />

        <TextField
          label="Currency"
          value={String(payload.currency || "")}
          placeholder="USD"
          onChange={(v) => setPayload((p) => ({ ...p, currency: v }))}
        />

        <TextField
          label="Badge"
          value={String(payload.badge || "")}
          placeholder="New"
          onChange={(v) => setPayload((p) => ({ ...p, badge: v }))}
        />
      </div>
    </SectionCard>
  );
}

export function SpecsSection({
  specs,
  onChange,
}: {
  specs: CarSpecs;
  onChange: (patch: Partial<CarSpecs>) => void;
}) {
  return (
    <SectionCard title="Specifications">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <NumberField
          label="0–100 km/h (sec)"
          value={specs.acceleration0to100Sec}
          placeholder="3.8"
          onChangeValue={(v) => onChange({ acceleration0to100Sec: v })}
        />

        <TextField
          label="Drivetrain"
          value={String(specs.drivetrain || "")}
          placeholder="AWD / RWD"
          onChange={(v) => onChange({ drivetrain: v || undefined })}
        />

        <TextField
          label="Transmission detail"
          value={String(specs.transmissionDetail || "")}
          placeholder="9-speed automatic"
          onChange={(v) => onChange({ transmissionDetail: v || undefined })}
        />

        <TextField
          label="Engine"
          value={String(specs.engine || "")}
          placeholder="4.0L V8 Twin-Turbo"
          onChange={(v) => onChange({ engine: v || undefined })}
        />
      </div>
    </SectionCard>
  );
}

export function OverviewBlocksSection({
  blocks,
  setBlocks,
}: {
  blocks: OverviewBlock[];
  setBlocks: (next: OverviewBlock[]) => void;
}) {
  return (
    <SectionCard
      title="Overview blocks"
      right={
        <button
          type="button"
          onClick={() => setBlocks([...(blocks || []), { title: "", text: "" }])}
          className="rounded-xl border border-white/10 bg-white/0 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
        >
          + Add block
        </button>
      }
    >
      <div className="text-[12px] text-white/45">
        Массив <b className="text-white/75">overviewBlocks</b> (title + text).
      </div>

      <div className="mt-3 space-y-3">
        {blocks.length ? (
          blocks.map((b, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-white/60">Block #{idx + 1}</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx === 0) return;
                      const next = [...blocks];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setBlocks(next);
                    }}
                    disabled={idx === 0}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs",
                      "border-white/10 bg-white/0 text-white/70 hover:bg-white/5",
                      idx === 0 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (idx === blocks.length - 1) return;
                      const next = [...blocks];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      setBlocks(next);
                    }}
                    disabled={idx === blocks.length - 1}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs",
                      "border-white/10 bg-white/0 text-white/70 hover:bg-white/5",
                      idx === blocks.length - 1 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    Down
                  </button>

                  <button
                    type="button"
                    onClick={() => setBlocks(blocks.filter((_, i) => i !== idx))}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/15"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField
                  label="Title"
                  value={String(b.title || "")}
                  placeholder="Overview"
                  onChange={(v) => {
                    const next = [...blocks];
                    next[idx] = { ...next[idx], title: v };
                    setBlocks(next);
                  }}
                />

                <div className="md:col-span-2">
                  <div className="text-[12px] text-white/60">Text</div>
                  <textarea
                    value={String(b.text || "")}
                    onChange={(e) => {
                      const next = [...blocks];
                      next[idx] = { ...next[idx], text: e.target.value };
                      setBlocks(next);
                    }}
                    className={cn(inputCls, "min-h-[96px] resize-y")}
                    placeholder="Write the block text..."
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/55">
            No blocks yet. Click <b className="text-white/80">+ Add block</b>.
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export function ImagesSection({
  savedCar,
  images,
  files,
  setFiles,
  uploading,
  onUpload,
}: {
  savedCar: Car | null;
  images: Array<{ url: string; alt?: string }>;
  files: File[];
  setFiles: (next: File[]) => void;
  uploading: boolean;
  onUpload: () => void;
}) {
  return (
    <SectionCard
      title="Images"
      right={
        <button
          type="button"
          disabled={!savedCar?._id || uploading || !files.length}
          onClick={onUpload}
          className={cn(
            "rounded-xl border px-4 py-2 text-xs",
            "border-white/10 bg-white/0 text-white/80 hover:bg-white/5",
            (!savedCar?._id || uploading || !files.length) && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      }
    >
      {!savedCar?._id ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/60">
          Save the car first to enable uploads.
        </div>
      ) : null}

      {images.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <div className="aspect-[4/3] w-full">
                <AssetImage src={img.url} alt={img.alt || ""} className="h-full w-full object-cover" />
              </div>
              {img.alt ? <div className="px-2 py-1 text-[11px] text-white/55">{img.alt}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/55">
          No images yet.
        </div>
      )}

      <div className="mt-3">
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white hover:file:bg-white/15"
        />
        {files.length ? (
          <div className="mt-2 text-[12px] text-white/55">
            Selected: <b className="text-white/80">{files.length}</b>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="ml-3 rounded-xl border border-white/10 bg-white/0 px-3 py-1 text-[11px] text-white/70 hover:bg-white/5"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
