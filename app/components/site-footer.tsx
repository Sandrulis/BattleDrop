export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-zinc-200 bg-white py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} BattleDrop · Weekly · Monthly · Annual
        </p>
        <div className="flex gap-6 text-xs font-medium text-zinc-500">
          <a href="#" className="hover:text-zinc-800">
            Rules
          </a>
          <a href="#" className="hover:text-zinc-800">
            Achievements
          </a>
          <a href="#" className="hover:text-zinc-800">
            Submit
          </a>
        </div>
      </div>
    </footer>
  );
}
