import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  'a',
  'aside',
  'br',
  'details',
  'div',
  'h2',
  'h3',
  'h4',
  'img',
  'li',
  'ol',
  'p',
  'section',
  'source',
  'span',
  'strong',
  'summary',
  'ul',
  'video',
]

const allowedAttributes = {
  a: ['class', 'href', 'id', 'rel', 'target', 'title'],
  div: ['class', 'id'],
  h2: ['class', 'id'],
  h3: ['class', 'id'],
  h4: ['class', 'id'],
  img: ['alt', 'class', 'height', 'id', 'loading', 'src', 'style', 'width'],
  li: ['class', 'id'],
  ol: ['class', 'id'],
  p: ['class', 'id'],
  section: ['class', 'id'],
  source: ['src', 'type'],
  span: ['class', 'id'],
  video: [
    'autoplay',
    'class',
    'controls',
    'height',
    'id',
    'loop',
    'muted',
    'playsinline',
    'poster',
    'preload',
    'src',
    'width',
  ],
}

const allowedStyles = {
  img: {
    width: [/^\d+(?:px|%)$/],
  },
}

export function sanitizeManualHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedAttributes,
    allowedTags,
    allowedStyles,
    allowProtocolRelative: false,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['data', 'http', 'https'],
      source: ['http', 'https'],
      video: ['http', 'https'],
    },
    disallowedTagsMode: 'discard',
  })
}
