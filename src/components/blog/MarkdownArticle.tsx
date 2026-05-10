import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { body: string };

export function MarkdownArticle({ body }: Props) {
  return (
    <div className="markdown-article text-body leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-heading text-heading text-3xl font-bold mt-12 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-heading text-heading text-2xl font-bold mt-10 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading text-heading text-xl font-bold mt-8 mb-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-heading text-heading text-lg font-bold mt-6 mb-2">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-body leading-relaxed mb-4">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-heading">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-6 mb-4 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-6 mb-4 space-y-2">{children}</ol>
          ),
          li: ({ children }) => <li className="text-body leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-brand-red underline hover:text-brand-red-hover"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-pink pl-4 italic text-body-muted my-6">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-surface-dim text-brand-red px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface-dim border border-border rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-border my-8" />,
          img: ({ src, alt }) => (
            <img
              src={typeof src === "string" ? src : undefined}
              alt={alt ?? ""}
              className="rounded-lg w-full my-6"
              loading="lazy"
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-dim border-b border-border">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left px-4 py-2 font-semibold text-heading">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-b border-border">{children}</td>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

export function readingTimeMinutes(body: string): number {
  const wordCount = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 220));
}
