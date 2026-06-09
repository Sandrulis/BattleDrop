import type { Product } from "@/app/lib/types";
import type { ArchiveProject } from "./types";

export function mapProductToArchiveProject(product: Product): ArchiveProject {
  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline,
    url: product.url,
    logo: product.logo,
    logoBg: product.logoBg,
    maker: product.maker,
    votes: product.votes,
    comments: product.comments,
    isPromoted: product.isPromoted,
  };
}
