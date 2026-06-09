function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string) {
  const trimmed = url.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  if (/^\//.test(trimmed)) return trimmed;

  return null;
}

function sanitizeImageUrl(url: string) {
  const trimmed = url.trim();
  const httpUrl = sanitizeUrl(trimmed);

  if (httpUrl) return httpUrl;

  if (/^\/blog-images\//.test(trimmed)) return trimmed;

  return null;
}

function escapePlainText(value: string) {
  return value.replace(/\n/g, "<br />").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type PlaceholderStore = {
  items: string[];
  stash: (html: string) => string;
  restore: (value: string) => string;
};

function createPlaceholderStore(): PlaceholderStore {
  const items: string[] = [];

  return {
    items,
    stash(html: string) {
      const key = `\x00BD${items.length}\x00`;
      items.push(html);
      return key;
    },
    restore(value: string) {
      let result = value;
      for (let index = 0; index < items.length; index += 1) {
        result = result.replace(`\x00BD${index}\x00`, items[index]!);
      }
      return result;
    },
  };
}

function parseImages(source: string, store: PlaceholderStore) {
  return source.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, (_, rawUrl: string) => {
    const url = sanitizeImageUrl(rawUrl);
    if (!url) return "";
    return store.stash(
      `<figure class="my-6"><img src="${escapeHtml(url)}" alt="" class="max-w-full rounded-xl border border-zinc-200" loading="lazy" /></figure>`,
    );
  });
}

function parseUrls(source: string, store: PlaceholderStore) {
  let result = source.replace(
    /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
    (_, rawUrl: string, label: string) => {
      const url = sanitizeUrl(rawUrl);
      const safeLabel = escapePlainText(label);
      if (!url) return safeLabel;
      return store.stash(
        `<a href="${escapeHtml(url)}" class="font-medium text-[#da552f] underline decoration-[#da552f]/30 underline-offset-2 hover:decoration-[#da552f]" rel="noopener noreferrer" target="_blank">${safeLabel}</a>`,
      );
    },
  );

  result = result.replace(
    /\[url\]([\s\S]*?)\[\/url\]/gi,
    (_, rawUrl: string) => {
      const url = sanitizeUrl(rawUrl);
      if (!url) return escapePlainText(rawUrl);
      const label = escapeHtml(url);
      return store.stash(
        `<a href="${escapeHtml(url)}" class="font-medium text-[#da552f] underline decoration-[#da552f]/30 underline-offset-2 hover:decoration-[#da552f]" rel="noopener noreferrer" target="_blank">${label}</a>`,
      );
    },
  );

  return result;
}

function parseLists(source: string, store: PlaceholderStore) {
  return source.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_, inner: string) => {
    const items = inner
      .split(/\[\*\]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) return "";

    const listItems = items
      .map((item) => `<li class="ml-5 list-disc">${escapePlainText(item)}</li>`)
      .join("");

    return store.stash(`<ul class="my-4 space-y-1">${listItems}</ul>`);
  });
}

function parseTaggedBlocks(
  source: string,
  store: PlaceholderStore,
  openTag: string,
  closeTag: string,
  render: (inner: string) => string,
) {
  const pattern = new RegExp(
    `\\[${openTag}\\]([\\s\\S]*?)\\[\\/${closeTag}\\]`,
    "gi",
  );

  return source.replace(pattern, (_, inner: string) => store.stash(render(inner)));
}

function parseInlineTags(source: string, store: PlaceholderStore) {
  let result = source;

  const blocks: Array<[string, string, (inner: string) => string]> = [
    ["b", "b", (inner) => `<strong>${escapePlainText(inner)}</strong>`],
    ["i", "i", (inner) => `<em>${escapePlainText(inner)}</em>`],
    ["u", "u", (inner) => `<span class="underline">${escapePlainText(inner)}</span>`],
    [
      "h1",
      "h1",
      (inner) =>
        `<h2 class="mt-8 text-2xl font-semibold tracking-tight text-zinc-900 first:mt-0">${escapePlainText(inner)}</h2>`,
    ],
    [
      "h2",
      "h2",
      (inner) =>
        `<h3 class="mt-6 text-xl font-semibold tracking-tight text-zinc-900 first:mt-0">${escapePlainText(inner)}</h3>`,
    ],
    [
      "h3",
      "h3",
      (inner) =>
        `<h4 class="mt-5 text-lg font-semibold text-zinc-900 first:mt-0">${escapePlainText(inner)}</h4>`,
    ],
    [
      "quote",
      "quote",
      (inner) =>
        `<blockquote class="my-4 border-l-4 border-zinc-200 pl-4 text-zinc-600 italic">${escapePlainText(inner)}</blockquote>`,
    ],
    [
      "code",
      "code",
      (inner) =>
        `<pre class="my-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800"><code>${escapeHtml(inner)}</code></pre>`,
    ],
  ];

  for (const [openTag, closeTag, render] of blocks) {
    result = parseTaggedBlocks(result, store, openTag, closeTag, render);
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (const [openTag, closeTag, render] of blocks) {
      result = parseTaggedBlocks(result, store, openTag, closeTag, render);
    }
  }

  return result;
}

export function parseBbcodeToHtml(source: string) {
  if (!source.trim()) return "";

  const store = createPlaceholderStore();
  let html = source;
  html = parseImages(html, store);
  html = parseUrls(html, store);
  html = parseLists(html, store);
  html = parseInlineTags(html, store);
  html = escapePlainText(html);

  return store.restore(html);
}

export const BBCODE_TOOLBAR = [
  { tag: "b", label: "Bold", open: "[b]", close: "[/b]" },
  { tag: "i", label: "Italic", open: "[i]", close: "[/i]" },
  { tag: "u", label: "Underline", open: "[u]", close: "[/u]" },
  { tag: "h2", label: "Heading", open: "[h2]", close: "[/h2]" },
  { tag: "url", label: "Link", open: "[url]", close: "[/url]" },
  { tag: "img", label: "Image", open: "[img]", close: "[/img]" },
  { tag: "quote", label: "Quote", open: "[quote]", close: "[/quote]" },
  { tag: "code", label: "Code", open: "[code]", close: "[/code]" },
  { tag: "list", label: "List", open: "[list][*]", close: "[/list]" },
] as const;
