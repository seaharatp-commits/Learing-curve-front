import type { ReactNode } from "react";

type AnswerBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; text: string };

interface FormattedAnswerProps {
  content: string;
  className?: string;
}

interface FormattedAnswerDisplay {
  title?: string;
  content: string;
}

function extractJsonLikeString(value: string, key: "title" | "content") {
  const match = value.match(new RegExp(`["']?${key}["']?\\s*:\\s*("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`, "i"));
  const rawValue = match?.[1];
  if (!rawValue) return "";

  if (rawValue.startsWith('"')) {
    try {
      return (JSON.parse(rawValue) as string).trim();
    } catch {
      return rawValue.slice(1, -1).trim();
    }
  }

  return rawValue.slice(1, -1).replace(/\\'/g, "'").trim();
}

function stripCodeFence(value: string) {
  return value
    .replace(/^```[a-z0-9_-]*\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeMarkdownArtifacts(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/([.!?:])\s+(\d+[.)]\s+)/g, "$1\n$2")
    .replace(/([^\n])\s+(\d+[.)]\s+)/g, "$1\n$2")
    .replace(/([^\n])\s+([-*\u2022]\s+)/g, "$1\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getJsonCandidate(value: string) {
  const unfenced = stripCodeFence(value);
  if (unfenced.startsWith("{") && unfenced.endsWith("}")) return unfenced;

  const firstBrace = unfenced.indexOf("{");
  const lastBrace = unfenced.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return unfenced.slice(firstBrace, lastBrace + 1).trim();
  }

  return "";
}

function parseDisplayJson(value: string, fallbackTitle?: string, depth = 0): FormattedAnswerDisplay | null {
  if (depth > 2) return null;
  const jsonCandidate = getJsonCandidate(value);
  if (!jsonCandidate) return null;

  try {
    const parsed = JSON.parse(jsonCandidate) as { title?: unknown; content?: unknown };
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const body = typeof parsed.content === "string" ? parsed.content.trim() : "";

    if (!title && !body) return null;
    if (body) {
      const nested = parseDisplayJson(body, title || fallbackTitle, depth + 1);
      if (nested) return nested;
    }

    return {
      title: title || fallbackTitle,
      content: body || stripCodeFence(value),
    };
  } catch {
    const title = extractJsonLikeString(jsonCandidate, "title");
    const body = extractJsonLikeString(jsonCandidate, "content");
    if (title || body) {
      return {
        title: title || fallbackTitle,
        content: body || stripCodeFence(value),
      };
    }
    return null;
  }
}

export function getFormattedAnswerDisplay(content: string, fallbackTitle?: string): FormattedAnswerDisplay {
  const trimmed = content.trim();
  const parsed = parseDisplayJson(trimmed, fallbackTitle);
  return parsed ?? { title: fallbackTitle, content: stripCodeFence(trimmed) };
}

function normalizeAnswerContent(content: string) {
  const display = getFormattedAnswerDisplay(content);
  return [display.title ? `## ${display.title}` : "", display.content].filter(Boolean).join("\n\n");
}

function parseAnswerBlocks(content: string): AnswerBlock[] {
  const normalizedContent = normalizeMarkdownArtifacts(normalizeAnswerContent(content));
  const lines = normalizedContent.split("\n");
  const blocks: AnswerBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: "unordered-list" | "ordered-list" | null = null;
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push({ type: listType, items: listItems });
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      if (inCodeBlock) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: headingMatch[1].trim() });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*\u2022]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "unordered-list") flushList();
      listType = "unordered-list";
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ordered-list") flushList();
      listType = "ordered-list";
      listItems.push(orderedMatch[1].trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({ type: "code", text: codeLines.join("\n") });
  }
  flushParagraph();
  flushList();

  return blocks.length > 0 ? blocks : [{ type: "paragraph", text: normalizeAnswerContent(content) }];
}

function renderInlineText(text: string): ReactNode[] {
  const safeText =
    (text.match(/\*\*/g)?.length ?? 0) % 2 === 1 || (text.match(/`/g)?.length ?? 0) % 2 === 1
      ? text.replace(/\*\*/g, "").replace(/`/g, "")
      : text;

  return safeText
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-default-800 dark:text-default-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-default-100 px-1 py-0.5 text-[0.92em] text-default-700 dark:bg-default-100/20 dark:text-default-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
}

export function FormattedAnswer({ content, className = "space-y-3" }: FormattedAnswerProps) {
  const blocks = parseAnswerBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="text-base font-semibold leading-7 text-default-800 dark:text-default-100">
              {renderInlineText(block.text)}
            </h3>
          );
        }
        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5 leading-7">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="list-decimal space-y-1.5 pl-5 leading-7">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg bg-default-100 p-3 text-xs leading-6 text-default-700 dark:bg-default-100/20 dark:text-default-200"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        return (
          <p key={index} className="leading-7">
            {renderInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}
