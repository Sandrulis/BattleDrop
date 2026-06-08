import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { getHomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";

import {

  getProductCommentCount,

  getProductComments,

} from "@/app/lib/product-comments";

import { getPublishedProjectProduct } from "@/app/lib/projects/get-published-project-product";

import { getUserProjectById } from "@/app/lib/projects/get-user-project-by-id";

import { buildScreenshotProxyUrl } from "@/app/lib/projects/project-utils";

import { userProjectToPreviewProduct } from "@/app/lib/projects/user-project-to-preview-product";

import { formatDisplayDate } from "@/app/lib/site-settings/format-display-date";

import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

import { getProductById } from "@/app/lib/mock-data";

import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";

import type { Product, ProductComment, UserProject } from "@/app/lib/types";



export type ProductLaunchStat =

  | { kind: "battle"; week: number; year: number }

  | { kind: "created"; label: string };



export type ProductPageData = {

  product: Product;

  comments: ProductComment[];

  launchStat: ProductLaunchStat;

  screenshotUrl: string | null;

  logoImageUrl: string | null;

  backHref: string;

  backLabel: string;

  isSignedIn: boolean;

  currentUserId: string | null;

  currentUserAvatarUrl: string | null;

  currentUserName: string | null;

  commentsEnabled: boolean;

};



function screenshotFromProject(

  project: Pick<UserProject, "fetch_url" | "screenshot_url">,

): string | null {

  return project.screenshot_url

    ? buildScreenshotProxyUrl(project.fetch_url, project.screenshot_url)

    : null;

}



function resolveLaunchStat(

  battleYear: number | null,

  battleIsoWeek: number | null,

  createdAt: string,

  dateSettings: SiteDateTimeSettings,

): ProductLaunchStat {

  if (battleYear != null && battleIsoWeek != null) {

    return { kind: "battle", year: battleYear, week: battleIsoWeek };

  }



  return {

    kind: "created",

    label: formatDisplayDate(createdAt, dateSettings),

  };

}



async function resolveDateSettingsForViewer() {

  const user = await getCurrentAppUser();

  if (user) {

    return getEffectiveDateTimeSettingsForUser(user.id);

  }



  const site = await getSiteSettings();

  return {

    dateFormat: site.dateFormat,

    timeFormat: site.timeFormat,

    dateSeparator: site.dateSeparator,

  };

}



async function withCommentStats(

  product: Product,

  id: string,

  dateSettings: SiteDateTimeSettings,

  viewerUserId?: string | null,

) {

  const [commentCount, comments] = await Promise.all([

    getProductCommentCount(id),

    getProductComments(id, dateSettings, viewerUserId),

  ]);



  return {

    product: { ...product, comments: commentCount },

    comments,

  };

}



async function ownerPageData(

  project: UserProject,

  makerName: string,

  dateSettings: SiteDateTimeSettings,

  isSignedIn: boolean,

  currentUserId: string | null,

  currentUserAvatarUrl: string | null,

  currentUserName: string | null,

): Promise<ProductPageData> {

  const { product, comments } = await withCommentStats(

    userProjectToPreviewProduct(project, makerName),

    project.id,

    dateSettings,

    currentUserId,

  );



  return {

    product,

    comments,

    launchStat: resolveLaunchStat(

      project.battle_year,

      project.battle_iso_week,

      project.created_at,

      dateSettings,

    ),

    screenshotUrl: screenshotFromProject(project),

    logoImageUrl: project.favicon_url,

    backHref: "/my-projects",

    backLabel: "Back to My Projects",

    isSignedIn,

    currentUserId,

    currentUserAvatarUrl,

    currentUserName,

    commentsEnabled: project.status === "published",

  };

}



export async function getProductPageData(

  id: string,

): Promise<ProductPageData | null> {

  const [homeBattleWeek, dateSettings, currentUser] = await Promise.all([

    getHomeBattleWeek(),

    resolveDateSettingsForViewer(),

    getCurrentAppUser(),

  ]);

  const isSignedIn = currentUser != null;
  const currentUserId = currentUser?.id ?? null;
  const currentUserAvatarUrl = currentUser?.avatar_url ?? null;
  const currentUserName = currentUser
    ? formatMakerHandle({
        full_name: currentUser.full_name,
        email: currentUser.email,
      })
    : null;

  const homeBattle = {

    year: homeBattleWeek.battle.year,

    week: homeBattleWeek.battle.week,

  };



  const published = await getPublishedProjectProduct(id);

  if (published) {

    const { product, comments } = await withCommentStats(

      published.product,

      id,

      dateSettings,

      currentUserId,

    );



    return {

      product,

      comments,

      launchStat: resolveLaunchStat(

        published.battleYear,

        published.battleIsoWeek,

        published.createdAt,

        dateSettings,

      ),

      screenshotUrl: published.screenshotUrl

        ? buildScreenshotProxyUrl(published.fetchUrl, published.screenshotUrl)

        : null,

      logoImageUrl: published.faviconUrl,

      backHref: "/",

      backLabel: "Back to this week",

      isSignedIn,

      currentUserId,

      currentUserAvatarUrl,

      currentUserName,

      commentsEnabled: true,

    };

  }



  if (currentUser) {

    const project = await getUserProjectById(id);

    if (project) {

      const makerName = currentUser.full_name ?? currentUser.email ?? "You";

      return ownerPageData(
        project,
        makerName,
        dateSettings,
        isSignedIn,
        currentUserId,
        currentUserAvatarUrl,
        currentUserName,
      );

    }

  }



  const mockProduct = getProductById(id);

  if (mockProduct) {

    const { product, comments } = await withCommentStats(

      mockProduct,

      id,

      dateSettings,

      currentUserId,

    );



    return {

      product,

      comments,

      launchStat: { kind: "battle", week: homeBattle.week, year: homeBattle.year },

      screenshotUrl: null,

      logoImageUrl: mockProduct.faviconUrl ?? null,

      backHref: "/",

      backLabel: "Back to this week",

      isSignedIn,

      currentUserId,

      currentUserAvatarUrl,

      currentUserName,

      commentsEnabled: false,

    };

  }



  return null;

}



export async function getProductPageMetadata(

  id: string,

): Promise<{ title: string; description: string } | null> {

  const published = await getPublishedProjectProduct(id);

  if (published) {

    return {

      title: published.product.name,

      description: published.product.tagline,

    };

  }



  const user = await getCurrentAppUser();

  if (user) {

    const project = await getUserProjectById(id);

    if (project) {

      return {

        title: project.name,

        description: project.tagline,

      };

    }

  }



  const mockProduct = getProductById(id);

  if (mockProduct) {

    return {

      title: mockProduct.name,

      description: mockProduct.tagline,

    };

  }



  return null;

}

