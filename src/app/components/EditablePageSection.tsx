import { useAdminData } from "../hooks/useAdminData";

interface EditablePageSectionProps {
  pageId: string;
  sectionKey?: string;
  className?: string;
}

export function EditablePageSection({
  pageId,
  sectionKey = "extra_content",
  className,
}: EditablePageSectionProps) {
  const { getPageOverride } = useAdminData();
  const html = getPageOverride(pageId, sectionKey);

  if (!html?.trim()) return null;

  return (
    <section className={className ?? "py-12 px-6"}>
      <div className="max-w-4xl mx-auto border border-white/8 bg-white/[0.02] p-6 md:p-8">
        <div
          className="font-['Oswald'] text-white/65 tracking-wide"
          style={{ fontSize: "0.95rem", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
