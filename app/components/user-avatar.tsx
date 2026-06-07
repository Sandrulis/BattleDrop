"use client";

import { useState } from "react";

type UserAvatarProps = {
  src?: string | null;
  name: string;
  imgClassName: string;
  fallbackClassName: string;
};

export function UserAvatar({
  src,
  name,
  imgClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (!src || failed) {
    return (
      <span className={fallbackClassName} aria-hidden>
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={imgClassName}
    />
  );
}
