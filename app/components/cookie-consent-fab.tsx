"use client";

type CookieConsentFabProps = {
  onClick: () => void;
};

export function CookieConsentFab({ onClick }: CookieConsentFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open cookie preferences"
      className="fixed bottom-6 left-5 z-[90] flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-[#da552f] shadow-xl transition-transform hover:scale-[1.03] hover:border-zinc-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da552f]/35"
    >
      <i className="fas fa-cookie-bite text-2xl" aria-hidden />
    </button>
  );
}
