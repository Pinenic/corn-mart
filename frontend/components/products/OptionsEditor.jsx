"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, GripVertical } from "lucide-react";
import { DEFAULT_OPTION_TYPES } from "@/lib/products-data";

/**
 * OptionsEditor
 *
 * Manages an array of option objects: { name: string, values: string[] }
 * Supports preset option types + custom named options.
 * Scalable — seller can add as many option types as needed.
 *
 * Props:
 *   options    — current options array
 *   onChange   — called with updated options array
 */
export function OptionsEditor({ options = [], onChange }) {
  const [newOptionName, setNewOptionName]   = useState("");
  const [showPresets, setShowPresets]       = useState(false);
  const [newValues, setNewValues]           = useState({}); // { optionIndex: string }

  const addOption = (name) => {
    if (!name.trim()) return;
    if (options.find((o) => o.name.toLowerCase() === name.toLowerCase())) return;
    onChange([...options, { name: name.trim(), values: [] }]);
    setNewOptionName("");
    setShowPresets(false);
  };

  const removeOption = (idx) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const addValue = (optIdx, value) => {
    if (!value.trim()) return;
    const opt = options[optIdx];
    if (opt.values.includes(value.trim())) return;
    const next = [...options];
    next[optIdx] = { ...opt, values: [...opt.values, value.trim()] };
    onChange(next);
    setNewValues((prev) => ({ ...prev, [optIdx]: "" }));
  };

  const removeValue = (optIdx, valIdx) => {
    const next = [...options];
    next[optIdx] = {
      ...next[optIdx],
      values: next[optIdx].values.filter((_, i) => i !== valIdx),
    };
    onChange(next);
  };

  // Preset quick-add
  const addPresetValues = (optIdx, presetName) => {
    const preset = DEFAULT_OPTION_TYPES.find((p) => p.name === presetName);
    if (!preset) return;
    const opt  = options[optIdx];
    const next = [...options];
    const merged = [...new Set([...opt.values, ...preset.values])];
    next[optIdx] = { ...opt, values: merged };
    onChange(next);
  };

  const unusedPresets = DEFAULT_OPTION_TYPES.filter(
    (p) => !options.find((o) => o.name.toLowerCase() === p.name.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Existing options */}
      {options.map((opt, optIdx) => (
        <div
          key={optIdx}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Option header */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
          >
            <GripVertical size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
            <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--color-text-primary)" }}>
              {opt.name}
            </span>
            <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
              {opt.values.length} value{opt.values.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => removeOption(optIdx)}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-red-50"
              style={{ color: "var(--color-danger)" }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Values */}
          <div className="p-3">
            {/* Current values */}
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
              {opt.values.length === 0 && (
                <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  No values yet — add some below
                </span>
              )}
              {opt.values.map((val, valIdx) => (
                <span
                  key={valIdx}
                  className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-text)" }}
                >
                  {val}
                  <button
                    onClick={() => removeValue(optIdx, valIdx)}
                    className="hover:opacity-60 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add value input */}
            <div className="flex gap-2 mb-2">
              <input
                value={newValues[optIdx] || ""}
                onChange={(e) => setNewValues((prev) => ({ ...prev, [optIdx]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addValue(optIdx, newValues[optIdx] || ""); }
                }}
                placeholder={`Add ${opt.name.toLowerCase()} value…`}
                className="flex-1 h-8 px-3 rounded-lg border text-[12px] outline-none transition-colors focus:border-[var(--color-accent)]"
                style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
              />
              <button
                onClick={() => addValue(optIdx, newValues[optIdx] || "")}
                className="h-8 px-3 rounded-lg text-[12px] font-medium transition-colors hover:bg-[var(--color-bg)]"
                style={{ border: "0.5px solid var(--color-border-md)", color: "var(--color-text-secondary)" }}
              >
                Add
              </button>
            </div>

            {/* Quick-load preset values if this matches a preset name */}
            {DEFAULT_OPTION_TYPES.find((p) => p.name.toLowerCase() === opt.name.toLowerCase()) && (
              <button
                onClick={() => addPresetValues(optIdx, opt.name)}
                className="text-[11px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-accent)" }}
              >
                + Load suggested {opt.name.toLowerCase()} values
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add new option */}
      <div
        className="rounded-xl border"
        style={{ borderColor: "var(--color-border)", borderStyle: "dashed" }}
      >
        <div className="p-3">
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Add option type
          </p>

          {/* Preset options */}
          {unusedPresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {unusedPresets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => addOption(p.name)}
                  className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors hover:bg-[var(--color-accent-subtle)]"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}
                >
                  <Plus size={10} /> {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Custom option name */}
          <div className="flex gap-2">
            <input
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(newOptionName); }}}
              placeholder="Custom option name (e.g. Scent, Voltage)…"
              className="flex-1 h-8 px-3 rounded-lg border text-[12px] outline-none transition-colors focus:border-[var(--color-accent)]"
              style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
            />
            <button
              onClick={() => addOption(newOptionName)}
              disabled={!newOptionName.trim()}
              className="h-8 px-3 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40"
              style={{ background: "var(--color-accent)", color: "white" }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {options.length > 0 && (
        <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          Options define what choices buyers see on your product page. Variants are automatically generated from option combinations.
        </p>
      )}
    </div>
  );
}
