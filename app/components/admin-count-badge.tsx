type AdminCountBadgeProps = {
  count: number;
  className?: string;
};

export function AdminCountBadge({ count, className = "" }: AdminCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={`inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
