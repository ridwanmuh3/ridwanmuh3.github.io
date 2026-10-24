/**
 * Monokai flavour used by Hugo's Chroma (default `monokai` style).
 *
 * Shiki ships VS Code's Monokai, which paints keywords `#F92672` where the
 * baseline paints them `#66D9EF`. This raw theme keeps the code blocks looking
 * like the Hugo build without adding CSS classes to `global.css` (Chroma emits
 * inline styles; so does Shiki).
 *
 * Values taken from Chroma's Pygments-derived Monokai mapping:
 * https://github.com/alecthomas/chroma/blob/master/styles/monokai.xml
 */
export const chromaMonokai = {
  name: 'chroma-monokai',
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#F8F8F2',
  },
  tokenColors: [
    { settings: { foreground: '#F8F8F2', background: '#272822' } },
    {
      name: 'Comment',
      scope: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring'],
      settings: { foreground: '#75715E', fontStyle: 'italic' },
    },
    {
      name: 'Keyword, storage, type',
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
        'variable.language',
      ],
      settings: { foreground: '#66D9EF' },
    },
    {
      name: 'Function and method names',
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#A6E22E' },
    },
    {
      name: 'Strings',
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
      settings: { foreground: '#E6DB74' },
    },
    {
      name: 'Numbers and constants',
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character.escape',
        'constant.other',
        'variable.other.constant',
      ],
      settings: { foreground: '#AE81FF' },
    },
    {
      name: 'Operators and punctuation',
      scope: [
        'keyword.operator',
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.accessor',
        'punctuation.definition.parameters',
      ],
      settings: { foreground: '#F8F8F2' },
    },
    {
      name: 'Parameters and variables',
      scope: ['variable.parameter', 'variable.other.readwrite', 'meta.parameter'],
      settings: { foreground: '#FD971F', fontStyle: 'italic' },
    },
    {
      name: 'Decorators and attributes',
      scope: ['entity.name.tag', 'meta.attribute', 'storage.annotation'],
      settings: { foreground: '#A6E22E' },
    },
  ],
};
