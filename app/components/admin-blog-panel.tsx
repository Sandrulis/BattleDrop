"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { BbcodeEditor } from "@/app/components/bbcode-editor";
import { Toast, useToast } from "@/app/components/toast";
import type { BlogArticle } from "@/app/lib/blog/blog-types";
import { slugifyBlogTitle } from "@/app/lib/blog/slugify-blog-title";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

type AdminBlogPanelProps = {
  initialArticles: BlogArticle[];
  dateSettings: SiteDateTimeSettings;
};

type ArticleFormState = {
  title: string;
  description: string;
  content: string;
  published: boolean;
};

const EMPTY_FORM: ArticleFormState = {
  title: "",
  description: "",
  content: "",
  published: false,
};

export function AdminBlogPanel({
  initialArticles,
  dateSettings,
}: AdminBlogPanelProps) {
  const router = useRouter();
  const formId = useId();
  const { toast, showToast, dismissToast } = useToast();
  const [articles, setArticles] = useState(initialArticles);
  const [form, setForm] = useState<ArticleFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const publishedCount = articles.filter((article) => article.published).length;
  const previewSlug = form.title.trim()
    ? slugifyBlogTitle(form.title)
    : "article-slug";

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(article: BlogArticle) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      description: article.description,
      content: article.content,
      published: article.published,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `/api/blog/${editingId}` : "/api/blog",
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      const data = (await response.json()) as BlogArticle & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save article.");
      }

      setArticles((current) => {
        if (isEditing) {
          return current.map((article) =>
            article.id === data.id ? data : article,
          );
        }
        return [data, ...current];
      });

      showToast(isEditing ? "Article updated." : "Article created.", "success");
      closeForm();
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save article.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublished(article: BlogArticle) {
    if (togglingId) return;

    const nextPublished = !article.published;
    const previous = articles;

    setArticles((current) =>
      current.map((item) =>
        item.id === article.id ? { ...item, published: nextPublished } : item,
      ),
    );
    setTogglingId(article.id);

    try {
      const response = await fetch(`/api/blog/${article.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextPublished }),
      });

      const data = (await response.json()) as BlogArticle & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update article.");
      }

      setArticles((current) =>
        current.map((item) => (item.id === data.id ? data : item)),
      );
      showToast(
        nextPublished ? "Article published." : "Article unpublished.",
        "success",
      );
      router.refresh();
    } catch (error) {
      setArticles(previous);
      showToast(
        error instanceof Error ? error.message : "Could not update article.",
        "error",
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(article: BlogArticle) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete "${article.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(article.id);

    try {
      const response = await fetch(`/api/blog/${article.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete article.");
      }

      setArticles((current) =>
        current.filter((item) => item.id !== article.id),
      );

      if (editingId === article.id) {
        closeForm();
      }

      showToast("Article deleted.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not delete article.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPanelSection
      title="Blog"
      description="Write articles with BBCode formatting. Published posts appear at /blog and in the site footer when at least one article is live."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {articles.length === 0
            ? "No articles yet."
            : `${publishedCount} published · ${articles.length} total`}
        </p>
        <button
          type="button"
          onClick={() => (showForm ? closeForm() : openCreateForm())}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <i className={`fas ${showForm ? "fa-xmark" : "fa-plus"} text-xs`} aria-hidden />
          {showForm ? "Cancel" : "New article"}
        </button>
      </div>

      {showForm ? (
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-zinc-900">
            {editingId ? "Edit article" : "New article"}
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor={`${formId}-title`}
                className="block text-sm font-medium text-zinc-700"
              >
                Title
              </label>
              <input
                id={`${formId}-title`}
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                maxLength={INPUT_LIMITS.blogTitle}
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
                placeholder="Article title"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Public URL: /blog/{previewSlug || "article-slug"}
              </p>
            </div>

            <div>
              <label
                htmlFor={`${formId}-description`}
                className="block text-sm font-medium text-zinc-700"
              >
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                maxLength={INPUT_LIMITS.blogDescription}
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
                placeholder="Short summary shown on the blog index and in metadata."
              />
            </div>

            <div>
              <label
                htmlFor={`${formId}-content`}
                className="block text-sm font-medium text-zinc-700"
              >
                Content (BBCode)
              </label>
              <div className="mt-1.5">
                <BbcodeEditor
                  id={`${formId}-content`}
                  value={form.content}
                  onChange={(content) =>
                    setForm((current) => ({ ...current, content }))
                  }
                  required
                />
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published: event.target.checked,
                  }))
                }
                className="size-4 rounded border-zinc-300 text-[#da552f] focus:ring-[#da552f]"
              />
              Publish immediately
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="cursor-pointer rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c04a29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <span
                  role="status"
                  aria-label="Loading"
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
              ) : null}
              {editingId ? "Save changes" : "Create article"}
            </button>
          </div>
        </form>
      ) : null}

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
          <i className="fas fa-newspaper text-2xl text-zinc-400" aria-hidden />
          <p className="mt-3 text-sm font-medium text-zinc-700">No articles yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first blog post with formatted text and images.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {article.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {article.description ? (
                    <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                      {article.description}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-zinc-500">
                    /blog/{article.slug}
                    {article.publishedAt
                      ? ` · ${formatDisplayDateTime(article.publishedAt, dateSettings)}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {article.published ? (
                    <Link
                      href={`/blog/${article.slug}`}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      View
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => openEditForm(article)}
                    className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={article.published}
                    aria-label={
                      article.published ? "Unpublish article" : "Publish article"
                    }
                    disabled={togglingId === article.id}
                    onClick={() => handleTogglePublished(article)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      article.published ? "bg-[#da552f]" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                        article.published
                          ? "translate-x-[1.375rem]"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(article)}
                    disabled={deletingId === article.id}
                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Delete ${article.title}`}
                  >
                    <i className="fas fa-trash-can" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </AdminPanelSection>
  );
}
