import { BUILTIN_LABELS, WELCOME_TEMPLATE_KEYS } from "@/lib/welcomeTemplates";

const loop = [...WELCOME_TEMPLATE_KEYS, ...WELCOME_TEMPLATE_KEYS, ...WELCOME_TEMPLATE_KEYS];

export function TemplateMarquee() {
  return (
    <div className="site-marquee-wrap overflow-hidden border-y border-white/10 py-3.5">
      <div className="site-marquee flex w-max gap-12 pr-12">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-[13px] font-medium tracking-[0.22em] text-white/55 uppercase"
          >
            {BUILTIN_LABELS[item]}
          </span>
        ))}
      </div>
    </div>
  );
}
