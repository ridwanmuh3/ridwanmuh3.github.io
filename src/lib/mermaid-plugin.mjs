/** ponytail: static diagrams live in public/diagrams; regenerate SVGs when source changes. */
export const mermaidPlugin = {
  name: 'mermaid-blocks',
  element: {
    filter: ['pre'],
    visit(node) {
      const children = node.children ?? [];
      if (children.length !== 1) return;
      const [code] = children;
      if (code.type !== 'element' || code.tagName !== 'code') return;

      const classes = code.properties?.className ?? [];
      if (!classes.includes('language-mermaid')) return;

      throw new Error('Render Mermaid diagrams to static SVG before publishing.');
    },
  },
};
