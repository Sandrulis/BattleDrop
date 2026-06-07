type ProjectLogoProps = {
  name: string;
  faviconUrl?: string | null;
  logo: string;
  logoBg: string;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: {
    box: "h-12 w-12 rounded-xl text-lg sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl",
    image: "h-8 w-8 sm:h-10 sm:w-10",
    letter: "text-lg sm:text-xl",
  },
  lg: {
    box: "h-16 w-16 rounded-2xl text-2xl",
    image: "h-12 w-12",
    letter: "text-2xl",
  },
} as const;

export function ProjectLogo({
  name,
  faviconUrl,
  logo,
  logoBg,
  size = "md",
}: ProjectLogoProps) {
  const sizes = sizeClasses[size];

  if (faviconUrl) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm ${sizes.box}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt=""
          className={`object-contain ${sizes.image}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold text-white shadow-sm ${sizes.box}`}
      style={{ backgroundColor: logoBg }}
      aria-hidden
    >
      <span className={sizes.letter}>{logo || name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
