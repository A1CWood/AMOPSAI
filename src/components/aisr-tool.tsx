"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  generatePlans,
  makeBlankRow,
  makeContinuationRow,
  parseTemplate,
  TemplateParseError,
  type FormationRow,
} from "@/lib/aisr";
import { copyToClipboard } from "@/lib/clipboard";

const BATCH_SIZE_OPTIONS = [1, 2, 3, 4, 5];

export function AisrTool() {
  const [rawTemplate, setRawTemplate] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [batchSize, setBatchSize] = useState(4);
  const [rows, setRows] = useState<FormationRow[]>([]);
  const [generated, setGenerated] = useState<{ id: string; text: string }[]>([]);

  const parsed = useMemo(() => {
    if (!rawTemplate.trim()) return { template: null, error: null as string | null };
    try {
      return { template: parseTemplate(rawTemplate), error: null };
    } catch (error) {
      if (error instanceof TemplateParseError) return { template: null, error: error.message };
      throw error;
    }
  }, [rawTemplate]);

  const effectiveRows = useMemo(() => {
    if (!parsed.template) return [];
    if (advanced) {
      return rows.length > 0 ? rows : [makeBlankRow(4)];
    }
    return [makeContinuationRow(parsed.template, batchSize - 1)];
  }, [parsed.template, advanced, rows, batchSize]);

  function handleGenerate() {
    if (!parsed.template) return;
    setGenerated(generatePlans(parsed.template, effectiveRows));
  }

  function addRow() {
    setRows((current) => [...(current.length > 0 ? current : effectiveRows), makeBlankRow(4)]);
  }

  function removeRow(id: string) {
    setRows((current) => (current.length > 0 ? current : effectiveRows).filter((row) => row.id !== id));
  }

  function updateRow(id: string, patch: Partial<FormationRow>) {
    setRows((current) =>
      (current.length > 0 ? current : effectiveRows).map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    );
  }

  const displayRows = advanced ? effectiveRows : [];

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-[#B0C4DE] p-6 text-black shadow-xl sm:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-center text-xl font-bold">Flight Plan</h2>
          <textarea
            value={rawTemplate}
            onChange={(event) => setRawTemplate(event.target.value)}
            placeholder="Paste flight plan here."
            rows={4}
            className="min-h-28 w-full rounded-md border border-gray-400 bg-white p-3 font-mono text-sm text-black placeholder:text-gray-500"
          />
          {parsed.error ? <p className="text-sm text-red-600">{parsed.error}</p> : null}

          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
              className="size-4"
            />
            Advanced mode
          </label>

          {!advanced ? (
            <label className="flex items-center gap-2 text-sm font-medium">
              Total Batch Size:
              <select
                value={batchSize}
                onChange={(event) => setBatchSize(Number(event.target.value))}
                className="rounded border border-gray-400 bg-white px-2 py-1 text-sm text-black"
              >
                {BATCH_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!parsed.template}
            className="min-h-11 rounded-md bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate
          </button>
        </div>

        {advanced ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl font-bold">Formations</h2>
            {!parsed.template ? (
              <p className="text-sm text-gray-700">Paste a template flight plan to configure formations.</p>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {displayRows.map((row) => (
                    <div key={row.id} className="flex flex-col gap-2 rounded-md border border-gray-400 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Formation</span>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          aria-label="Remove formation"
                          className="rounded p-1 hover:bg-gray-200"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        <FormationField label="Callsign">
                          <input
                            value={row.callsign}
                            onChange={(event) => updateRow(row.id, { callsign: event.target.value })}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </FormationField>
                        <FormationField label="Acft type">
                          <input
                            value={row.acftType}
                            onChange={(event) => updateRow(row.id, { acftType: event.target.value })}
                            placeholder="F35"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                          <span className="text-[10px] text-gray-500">&quot;/I&quot; added automatically</span>
                        </FormationField>
                        <FormationField label="IFF (optional)">
                          <input
                            value={row.iff}
                            onChange={(event) => updateRow(row.id, { iff: event.target.value })}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </FormationField>
                        <FormationField label="Dep time">
                          <input
                            value={row.departureTime}
                            onChange={(event) => updateRow(row.id, { departureTime: event.target.value })}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </FormationField>
                        <FormationField label="Qty">
                          <input
                            type="number"
                            min={1}
                            max={8}
                            value={row.quantity}
                            onChange={(event) =>
                              updateRow(row.id, { quantity: Number(event.target.value) })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </FormationField>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex min-h-11 items-center justify-center gap-1 rounded-md border border-dashed border-gray-500 py-2 text-sm font-medium hover:bg-white/50"
                >
                  <Plus className="size-4" />
                  Add formation
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {generated.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3">
          {generated.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => copyToClipboard(plan.text)}
              className="whitespace-pre-wrap rounded-md bg-white p-3 text-left font-mono text-sm hover:bg-gray-100"
            >
              {plan.text}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FormationField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
      {label}
      {children}
    </label>
  );
}
