type BrandMarkProps = {
  variant?: "lockup" | "onDark" | "mark";
  className?: string;
};

export function BrandMark({ variant = "lockup", className = "" }: BrandMarkProps) {
  if (variant === "mark") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/brand/mark.svg"
        alt="SignageHub"
        className={`size-8 ${className}`.trim()}
      />
    );
  }

  if (variant === "onDark") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.svg" alt="" className="h-7 w-auto" />
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Signage<span className="text-[#7DD3FC]">Hub</span>
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt="SignageHub"
      className={`h-7 w-auto ${className}`.trim()}
    />
  );
}
