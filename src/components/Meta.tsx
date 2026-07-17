import { useEffect } from 'react';
import type { MetaData } from '../utils/seo';
import { SITE_NAME } from '../utils/seo';

interface MetaProps {
  data: MetaData;
}

export const Meta = ({ data }: MetaProps) => {
  useEffect(() => {
    document.title = data.title;

    const updateMetaTag = (name: string, content: string, property = false) => {
      let element = document.querySelector(
        property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      ) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement('meta');
        property ? element.setAttribute('property', name) : element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard meta tags
    updateMetaTag('description', data.description);

    // Open Graph tags
    updateMetaTag('og:title', data.title, true);
    updateMetaTag('og:description', data.description, true);
    updateMetaTag('og:image', data.image, true);
    updateMetaTag('og:url', data.url, true);
    updateMetaTag('og:type', data.type, true);
    updateMetaTag('og:site_name', SITE_NAME, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', data.title);
    updateMetaTag('twitter:description', data.description);
    updateMetaTag('twitter:image', data.image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = data.url;
  }, [data]);

  return null;
};
