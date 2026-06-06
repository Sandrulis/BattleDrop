type AdminPanelSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminPanelSection({
  title,
  description,
  children,
}: AdminPanelSectionProps) {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      </div>

      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}
