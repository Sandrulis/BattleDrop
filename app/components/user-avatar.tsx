"use client";

import { useState } from "react";
import { formatUserAvatarInitials } from "@/app/lib/users/format-user-avatar-initials";

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
  const initials = formatUserAvatarInitials(name);

  if (!src || failed) {
    return (
      <span className={fallbackClassName} aria-hidden>
        {initials}
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
