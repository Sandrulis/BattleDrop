import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-11 w-11 border-[3px]",
} as const;

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin motion-reduce:animate-none rounded-full border-zinc-200 border-t-[#da552f] ${sizeClasses[size]} ${className}`}
    />
  );
}

type PageLoadingProps = {
  label?: string;
};

export function PageLoading({ label = "Loading…" }: PageLoadingProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium text-zinc-500">{label}</p>
    </div>
  );
}

type SiteRouteLoadingProps = {
  label?: string;
  mainClassName?: string;
};

export function SiteRouteLoading({
  label,
  mainClassName = "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8",
}: SiteRouteLoadingProps) {
  return (
    <>
      <SiteHeader />
      <main className={mainClassName}>
        <PageLoading label={label} />
      </main>
      <SiteFooter />
    </>
  );
}
