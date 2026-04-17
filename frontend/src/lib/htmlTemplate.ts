export type ParsedHtmlTemplate = {
  title: string;
  htmlClassName: string;
  bodyClassName: string;
  bodyStyleText: string;
  bodyHtml: string;
  styles: string[];
};

const templateCache = new Map<string, ParsedHtmlTemplate>();

export function parseHtmlTemplate(rawHtml: string): ParsedHtmlTemplate {
  const cached = templateCache.get(rawHtml);

  if (cached) {
    return cached;
  }

  const documentParser = new DOMParser();
  const doc = documentParser.parseFromString(rawHtml, 'text/html');
  const body = doc.body.cloneNode(true) as HTMLBodyElement;

  body.querySelectorAll('script').forEach((script) => script.remove());

  const parsed = {
    title: doc.title,
    htmlClassName: doc.documentElement.getAttribute('class') ?? '',
    bodyClassName: doc.body.getAttribute('class') ?? '',
    bodyStyleText: doc.body.getAttribute('style') ?? '',
    bodyHtml: body.innerHTML,
    styles: [...doc.querySelectorAll('style')]
      .map((styleNode) => styleNode.textContent ?? '')
      .filter(Boolean),
  };

  templateCache.set(rawHtml, parsed);
  return parsed;
}
