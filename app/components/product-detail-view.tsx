"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product, ProductComment } from "../lib/types";
import { CommentThread } from "./comment-thread";
import { ProductDetailSidebar } from "./product-detail-sidebar";
import { VoteButton } from "./vote-comment-buttons";

type ProductDetailViewProps = {
  product: Product;
  comments: ProductComment[];
};

export function ProductDetailView({ product, comments }: ProductDetailViewProps) {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(product.votes);

  function toggleVote() {
    setVoted((prev) => {
      setVoteCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  return (
    <div className="w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        ← Back to this week
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0">
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
            <VoteButton count={voteCount} voted={voted} onClick={toggleVote} />
            <div className="flex min-w-0 gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
                style={{ backgroundColor: product.logoBg }}
              >
                {product.logo}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {product.name}
                  </h1>
                  {product.isPromoted && (
                    <span id={`promoted-badge-${product.id}`} className="promoted-badge">
                      Promoted
                    </span>
                  )}
                </div>
                <p className="mt-1 text-base text-zinc-600">{product.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-zinc-500">
                  <a
                    href={`https://${product.url}`}
                    className="font-medium text-[#da552f] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit {product.url} ↗
                  </a>
                  <span className="text-zinc-300">·</span>
                  <span>by {product.maker}</span>
                  {product.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="flex w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-zinc-200 bg-zinc-50 px-1 py-2 text-zinc-500 sm:w-[56px]"
              aria-label={`${product.comments} comments`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="text-sm font-semibold tabular-nums text-zinc-800">
                {product.comments}
              </span>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              About
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              {product.description}
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Comments
                <span className="ml-2 text-base font-normal text-zinc-400">
                  {product.comments}
                </span>
              </h2>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
              <textarea
                placeholder="Add a comment… Sign in with Google to post"
                rows={3}
                disabled
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <p className="mt-2 text-xs text-zinc-400">
                Demo mode — connect Google account to join the discussion
              </p>
            </div>

            <div className="mt-6">
              <CommentThread comments={comments} />
            </div>
          </section>
        </div>

        <ProductDetailSidebar product={product} voteCount={voteCount} />
      </div>
    </div>
  );
}
