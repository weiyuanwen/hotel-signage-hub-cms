"use client";

import { useTranslations } from "next-intl";
import { TemplateThumb } from "@/components/TemplateThumb";
import type { WelcomeTemplate } from "@/lib/api";
import { isWelcomeTemplateKey } from "@/lib/welcomeTemplates";

type Props = {
  templates: WelcomeTemplate[];
  value: string;
  onChange: (key: string) => void;
};

export function TemplatePicker({ templates, value, onChange }: Props) {
  const t = useTranslations("desk.picker");
  const tt = useTranslations("templates");

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t("legend")}</legend>
      <p className="text-xs text-muted">{t("hint")}</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((row) => {
          const selected = row.key === value;
          const label = row.display_name?.trim()
            ? row.display_name
            : isWelcomeTemplateKey(row.key)
              ? tt(row.key)
              : row.label;
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onChange(row.key)}
              className={`w-[7.5rem] text-left transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selected ? "" : "opacity-80 hover:opacity-100"
              }`}
            >
              <TemplateThumb templateKey={row.key} selected={selected} />
              <span className="mt-1 block truncate text-xs text-muted">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
