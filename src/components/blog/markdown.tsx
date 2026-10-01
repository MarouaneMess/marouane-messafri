"use client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block">
      <button
        className="copy-button"
        aria-label="Copier le code"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(ref.current?.textContent || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copié" : "Copier"}
      </button>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false }]]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          h2: ({ id, children }) => (
            <h2 id={id}>
              <a href={`#${id}`}>{children}</a>
            </h2>
          ),
          h3: ({ id, children }) => (
            <h3 id={id}>
              <a href={`#${id}`}>{children}</a>
            </h3>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              {...(href?.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" &&
            /^\/(api\/media|images|projects)\//.test(src) ? (
              <Image
                src={src}
                width={1000}
                height={650}
                style={{ width: "100%", height: "auto" }}
                alt={alt || "Illustration de l’article"}
              />
            ) : (
              <span>{alt}</span>
            ),
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
