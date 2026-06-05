import { Skeleton } from "./skeleton";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

function ProductRowSkeleton() {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 sm:gap-4 sm:p-4">
      <Skeleton className="h-14 w-[52px] rounded-lg sm:w-[56px]" />
      <div className="flex min-w-0 gap-3 sm:gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-14 w-[52px] rounded-lg sm:w-[56px]" />
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 rounded-2xl border border-orange-200/80 bg-white p-4 sm:p-5">
          <Skeleton className="mb-3 h-3 w-32" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-full max-w-lg" />
          <div className="mt-4 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <div className="mt-5 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-36 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
          <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px] lg:gap-8">
          <div className="space-y-2">
            <div className="mb-3 flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductRowSkeleton key={i} />
            ))}
          </div>
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function ProductLoadingSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px] lg:gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <Skeleton className="h-16 w-[56px] rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-[56px] rounded-lg" />
            </div>
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function ArchiveLoadingSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-8 w-52" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="mt-6 h-4 w-64" />
          <div className="mt-8 space-y-10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-32" />
                <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-28 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
