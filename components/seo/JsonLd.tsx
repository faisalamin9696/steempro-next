import type { JsonLdNode } from "@/utils/jsonld";

/**
 * Emits schema.org structured data as an inline JSON-LD block.
 *
 * Server-rendered: the `<script>` is part of the HTML we return, so crawlers
 * read it without executing any of the client bundle.
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  // `<` would let a string break out of the script element.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
