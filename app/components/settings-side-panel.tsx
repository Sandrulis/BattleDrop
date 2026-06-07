import Link from "next/link";
import { UserAvatar } from "@/app/components/user-avatar";
import { formatDisplayDate, formatLastSeen } from "@/app/lib/site-settings/format-display-date";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import type { AppUser } from "@/app/lib/types";

type SettingsSidePanelProps = {
  user: AppUser;
};

export async function SettingsSidePanel({ user }: SettingsSidePanelProps) {
  const siteSettings = await getSiteSettings();
  const dateSettings = resolveEffectiveDateTimeSettings(
    {
      dateFormat: siteSettings.dateFormat,
      timeFormat: siteSettings.timeFormat,
      dateSeparator: siteSettings.dateSeparator,
    },
    {
      dateFormat: user.date_format,
      timeFormat: user.time_format,
      dateSeparator: user.date_separator,
    },
  );

  const displayName = user.full_name?.trim() || user.email || "Founder";

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Your account</h3>
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            src={user.avatar_url}
            name={displayName}
            imgClassName="h-10 w-10 rounded-lg object-cover"
            fallbackClassName="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 text-sm font-medium text-zinc-700"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Member since</dt>
            <dd className="font-medium text-zinc-900">
              {formatDisplayDate(user.created_at, dateSettings)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Last seen</dt>
            <dd className="font-medium text-zinc-900">
              {formatLastSeen(user.last_seen, dateSettings)}
            </dd>
          </div>
          {user.is_admin ? (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Role</dt>
              <dd className="font-medium text-zinc-900">Admin</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Quick links</h3>
        <ul className="mt-3 space-y-2 text-xs">
          <li>
            <Link
              href="/my-projects"
              className="font-medium text-[#da552f] hover:underline"
            >
              My Projects →
            </Link>
          </li>
          <li>
            <Link href="/submit" className="font-medium text-[#da552f] hover:underline">
              Submit product →
            </Link>
          </li>
          {user.is_admin ? (
            <li>
              <Link
                href="/admin-panel"
                className="font-medium text-[#da552f] hover:underline"
              >
                Admin panel →
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </aside>
  );
}
