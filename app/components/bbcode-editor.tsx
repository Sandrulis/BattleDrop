"use client";

import { useId, useRef, useState } from "react";
import { BbcodeContent } from "@/app/components/bbcode-content";
import { BBCODE_TOOLBAR } from "@/app/lib/blog/parse-bbcode";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";

type BbcodeEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
};

export function BbcodeEditor({
  id,
  value,
  onChange,
  maxLength = INPUT_LIMITS.blogContent,
  required = false,
  placeholder = "Write your article content…",
}: BbcodeEditorProps) {
  const fallbackId = useId();
  const textareaId = id ?? fallbackId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function insertAtCursor(before: string, after: string, placeholderText = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholderText;
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);

    if (nextValue.length > maxLength) return;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function handleToolbarClick(open: string, close: string) {
    insertAtCursor(open, close, open === "[url]" ? "https://" : "text");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/blog/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not upload image.");
      }

      insertAtCursor(`[img]${data.url}[/img]`, "", "");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not upload image.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files.item(0);
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Only image files can be dropped here.");
      return;
    }

    await uploadImage(file);
  }

  async function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.item(0);
    event.target.value = "";

    if (!file) return;
    await uploadImage(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {BBCODE_TOOLBAR.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => handleToolbarClick(item.open, item.close)}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {item.label}
          </button>
        ))}

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
          <i className="fas fa-image text-[11px]" aria-hidden />
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            onChange={handleFileInput}
            disabled={uploading}
          />
        </label>

        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          {showPreview ? "Edit" : "Preview"}
        </button>

        {uploading ? (
          <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <span
              role="status"
              aria-label="Loading"
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-[#da552f] motion-reduce:animate-none"
            />
            Uploading image…
          </span>
        ) : null}
      </div>

      {uploadError ? (
        <p className="text-sm text-red-600">{uploadError}</p>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border bg-white transition-colors ${
          dragOver
            ? "border-[#da552f] bg-orange-50/40"
            : "border-zinc-200"
        }`}
      >
        {showPreview ? (
          <div className="min-h-64 p-4 sm:p-5">
            {value.trim() ? (
              <BbcodeContent source={value} />
            ) : (
              <p className="text-sm text-zinc-400">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              id={textareaId}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              maxLength={maxLength}
              required={required}
              rows={14}
              placeholder={placeholder}
              className="min-h-64 w-full resize-y rounded-2xl bg-transparent px-4 py-3 text-sm text-zinc-900 outline-none sm:px-5 sm:py-4"
            />
            <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500 sm:px-5">
              Drag and drop images here to insert them into the article.
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        {value.length.toLocaleString("en-US")} / {maxLength.toLocaleString("en-US")}{" "}
        characters
      </p>
    </div>
  );
}
