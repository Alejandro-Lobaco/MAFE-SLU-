export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id?: string;
  align?: "left" | "center";
}) {
  return (
    <div data-reveal className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="section-title mt-3">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-mist">{intro}</p>}
    </div>
  );
}
