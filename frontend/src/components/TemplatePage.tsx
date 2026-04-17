import { useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { parseHtmlTemplate } from '../lib/htmlTemplate';
import { resolveAppRoute } from '../lib/routes';

function useInjectedPageAssets(pageKey: string, htmlClassName: string, styles: string[], title: string) {
  useLayoutEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const styleElements = styles.map((styleContent, index) => {
      const styleElement = document.createElement('style');
      styleElement.dataset.pageStyle = `${pageKey}-${index}`;
      styleElement.textContent = styleContent;
      document.head.appendChild(styleElement);
      return styleElement;
    });

    document.title = title;
    document.documentElement.className = htmlClassName || '';

    return () => {
      document.title = previousTitle;
      document.documentElement.className = previousHtmlClassName;
      styleElements.forEach((styleElement) => styleElement.remove());
    };
  }, [htmlClassName, pageKey, styles, title]);
}

export function TemplatePage({ pageKey, rawHtml, setup }: { pageKey: string; rawHtml: string; setup?: (args: { root: HTMLDivElement; navigate: ReturnType<typeof useNavigate> }) => void | (() => void) }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const template = useMemo(() => parseHtmlTemplate(rawHtml), [rawHtml]);

  useInjectedPageAssets(pageKey, template.htmlClassName, template.styles, template.title);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    root.style.cssText = template.bodyStyleText;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');

      if (!anchor || !root.contains(anchor)) {
        return;
      }

      const resolvedRoute = resolveAppRoute(anchor.getAttribute('href'));

      if (resolvedRoute) {
        event.preventDefault();
        navigate(resolvedRoute);
      }
    };

    root.addEventListener('click', handleClick);
    const cleanup = setup?.({ root, navigate }) ?? (() => {});

    return () => {
      root.removeEventListener('click', handleClick);
      cleanup();
      root.style.cssText = '';
    };
  }, [navigate, setup, template.bodyStyleText]);

  return (
    <div
      ref={rootRef}
      className={template.bodyClassName}
      dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
    />
  );
}
