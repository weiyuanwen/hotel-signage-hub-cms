import type { AppPathname } from "@/i18n/routing";
import type { MarketingSection } from "@/lib/marketing-metadata";

export type PublicNode = {
  section: Exclude<MarketingSection, "login">;
  href: AppPathname;
  related: AppPathname[];
};

export const PUBLIC_TREE: PublicNode[] = [
  { section: "home", href: "/", related: ["/product", "/gallery", "/pricing", "/faq"] },
  { section: "product", href: "/product", related: ["/gallery", "/pricing", "/faq"] },
  { section: "gallery", href: "/gallery", related: ["/product", "/pricing", "/join"] },
  { section: "pricing", href: "/pricing", related: ["/product", "/faq", "/join"] },
  { section: "faq", href: "/faq", related: ["/product", "/pricing", "/gallery"] },
  { section: "join", href: "/join", related: ["/product", "/pricing", "/faq"] },
  { section: "directory", href: "/directory", related: ["/", "/product", "/gallery", "/pricing"] },
];

export function treeNode(section: MarketingSection): PublicNode | undefined {
  return PUBLIC_TREE.find((node) => node.section === section);
}
