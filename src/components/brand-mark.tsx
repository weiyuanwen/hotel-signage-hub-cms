import Image from "next/image";

type BrandMarkProps = {
  variant?: "lockup" | "onDark" | "mark";
  className?: string;
};

export function BrandMark({ variant = "lockup", className = "" }: BrandMarkProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/brand/app-icon.png"
        alt="SignageHub"
        width={36}
        height={36}
        className={`size-8 rounded-[9px] ${className}`.trim()}
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
    <Image
      src="/brand/logo.png"
      alt="SignageHub"
      width={238}
      height={80}
      className={`h-7 w-auto ${className}`.trim()}
      priority
    />
  );
}
