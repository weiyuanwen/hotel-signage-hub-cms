"use client";

import { TemplateThumb } from "@/components/TemplateThumb";
import type { WelcomeTemplate } from "@/lib/api";

type Props = {
  templates: WelcomeTemplate[];
  value: string;
  onChange: (key: string) => void;
};

export function TemplatePicker({ templates, value, onChange }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Mẫu trên TV</legend>
      <div className="flex flex-wrap gap-2">
        {templates.map((row) => {
          const selected = row.key === value;
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onChange(row.key)}
              className={`w-[7.5rem] text-left ${selected ? "" : "opacity-80"}`}
            >
              <TemplateThumb templateKey={row.key} selected={selected} />
              <span className="mt-1 block text-xs text-muted">{row.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
