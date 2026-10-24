/**
 * Hugo's `_markup/render-codeblock-mermaid.html` emits `<pre class="mermaid">`
 * with the diagram source as its text content. Astro's Markdown pipeline leaves
 * a fenced block as `<pre><code class="language-mermaid">`, so this hast plugin
 * rewrites the pair into the element Hugo produces.
 *
 * The text is escaped once by the serializer, exactly like Hugo's template
 * engine, and Mermaid reads `textContent` back out of it.
 */
export const mermaidPlugin = {
  name: 'mermaid-blocks',
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      const children = node.children ?? [];
      if (children.length !== 1) return;
      const [code] = children;
      if (code.type !== 'element' || code.tagName !== 'code') return;

      const classes = code.properties?.className ?? [];
      if (!classes.includes('language-mermaid')) return;

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: ctx.textContent(code) }],
      });
    },
  },
};
