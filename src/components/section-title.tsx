import { Badge } from "@/components/ui/badge";

export function SectionTitle({
  badge,
  title,
  text,
  align = "center",
}: {
  badge: string;
  title: string;
  text: string;
  align?: "center" | "right";
}) {
  return (
    <div className={align === "center" ? "section-heading" : "max-w-3xl text-right"}>
      <Badge>{badge}</Badge>
      <h2 className="section-title">{title}</h2>
      <p className="section-copy">{text}</p>
    </div>
  );
}
