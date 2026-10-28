type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * JSON for a `<script type="application/ld+json">`: `<` is escaped so a value
 * containing `</script>` (titles from the stories table, for example) cannot end
 * the script element early. The JSON stays valid; parsers read `<` as `<`.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
