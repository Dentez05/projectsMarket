import { useEffect } from 'react';

const SITE_NAME = 'ProjectMarket';

function setMetaContent(selector: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const isProp = selector.includes('property=');
    if (isProp) {
      const m = selector.match(/property="([^"]+)"/);
      if (m) el.setAttribute('property', m[1]);
    } else {
      const m = selector.match(/name="([^"]+)"/);
      if (m) el.setAttribute('name', m[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  /** og:image — абсолютный или относительный URL */
  image?: string;
  /** canonical path, например /projects/1 */
  path?: string;
  /** noindex для служебных страниц */
  noindex?: boolean;
  /** JSON-LD объект (или массив) — вставляется в <script type="application/ld+json"> */
  jsonLd?: unknown;
}

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '');

// Простой SEO-хук: title, description, keywords, OG/Twitter, canonical, robots, JSON-LD
// (react-helmet-async несовместим с React 19)
export function useSeo(options: SeoOptions): void {
  useEffect(() => {
    const prevTitle = document.title;
    const fullTitle = options.title.includes(SITE_NAME) ? options.title : `${options.title} — ${SITE_NAME}`;
    document.title = fullTitle;

    if (options.description) {
      setMetaContent('meta[name="description"]', options.description);
      setMetaContent('meta[property="og:description"]', options.description);
      setMetaContent('meta[name="twitter:description"]', options.description);
    }
    if (options.keywords) setMetaContent('meta[name="keywords"]', options.keywords);

    setMetaContent('meta[property="og:title"]', fullTitle);
    setMetaContent('meta[name="twitter:title"]', fullTitle);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[property="og:locale"]', 'ru_RU');

    if (options.image) {
      const abs = options.image.startsWith('http')
        ? options.image
        : `${SITE_URL}${options.image.startsWith('/') ? '' : '/'}${options.image}`;
      setMetaContent('meta[property="og:image"]', abs);
      setMetaContent('meta[name="twitter:image"]', abs);
    }

    // canonical
    const canonicalHref = options.path
      ? `${SITE_URL}${options.path.startsWith('/') ? '' : '/'}${options.path}`
      : undefined;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalHref) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalHref;
      setMetaContent('meta[property="og:url"]', canonicalHref);
    }

    // robots
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (options.noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';
    } else if (robots) {
      robots.remove();
    }

    // JSON-LD
    const scripts = Array.from(document.querySelectorAll('script[data-seo-jsonld]'));
    scripts.forEach(s => s.remove());
    if (options.jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '1');
      s.textContent = JSON.stringify(options.jsonLd);
      document.head.appendChild(s);
    }

    return () => {
      document.title = prevTitle;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.title, options.description, options.keywords, options.image, options.path, options.noindex]);
}
