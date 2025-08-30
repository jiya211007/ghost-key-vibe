import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class SEOService {
  constructor() {
    this.baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    this.siteName = 'Devnovate';
    this.siteDescription = 'A modern blogging and article platform for developers and creators';
    this.defaultImage = `${this.baseUrl}/images/default-og.jpg`;
  }

  // Generate meta tags for a page
  generateMetaTags(pageData = {}) {
    const {
      title,
      description,
      image,
      url,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
      tags = [],
      readingTime,
      category
    } = pageData;

    const metaTags = {
      // Basic meta tags
      title: title ? `${title} | ${this.siteName}` : this.siteName,
      description: description || this.siteDescription,
      
      // Open Graph tags
      'og:title': title || this.siteName,
      'og:description': description || this.siteDescription,
      'og:image': image || this.defaultImage,
      'og:url': url || this.baseUrl,
      'og:type': type,
      'og:site_name': this.siteName,
      'og:locale': 'en_US',
      
      // Twitter Card tags
      'twitter:card': 'summary_large_image',
      'twitter:site': '@devnovate',
      'twitter:title': title || this.siteName,
      'twitter:description': description || this.siteDescription,
      'twitter:image': image || this.defaultImage,
      
      // Article specific tags
      'article:author': author,
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:section': category,
      'article:tag': tags.join(', '),
      
      // Additional meta tags
      'author': author || this.siteName,
      'keywords': tags.join(', '),
      'robots': 'index, follow',
      'viewport': 'width=device-width, initial-scale=1.0',
      'theme-color': '#3B82F6'
    };

    return metaTags;
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(type, data) {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      'publisher': {
        '@type': 'Organization',
        'name': this.siteName,
        'url': this.baseUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${this.baseUrl}/images/logo.png`
        }
      }
    };

    switch (type) {
      case 'Article':
        return {
          ...baseStructuredData,
          '@type': 'Article',
          'headline': data.title,
          'description': data.description,
          'image': data.image || this.defaultImage,
          'author': {
            '@type': 'Person',
            'name': data.author?.name || data.author?.username,
            'url': `${this.baseUrl}/profile/${data.author?.username}`
          },
          'datePublished': data.publishedAt,
          'dateModified': data.updatedAt,
          'articleSection': data.category,
          'keywords': data.tags?.join(', '),
          'wordCount': data.wordCount,
          'timeRequired': `PT${data.readingTime || 5}M`,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${this.baseUrl}/articles/${data.slug}`
          }
        };

      case 'Person':
        return {
          ...baseStructuredData,
          '@type': 'Person',
          'name': data.name,
          'url': `${this.baseUrl}/profile/${data.username}`,
          'image': data.avatar || this.defaultImage,
          'description': data.bio,
          'sameAs': data.socialLinks || []
        };

      case 'Organization':
        return {
          ...baseStructuredData,
          '@type': 'Organization',
          'name': this.siteName,
          'url': this.baseUrl,
          'description': this.siteDescription,
          'logo': `${this.baseUrl}/images/logo.png`,
          'sameAs': [
            'https://twitter.com/devnovate',
            'https://github.com/devnovate'
          ]
        };

      case 'WebSite':
        return {
          ...baseStructuredData,
          '@type': 'WebSite',
          'name': this.siteName,
          'url': this.baseUrl,
          'description': this.siteDescription,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${this.baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        };

      default:
        return baseStructuredData;
    }
  }

  // Generate sitemap XML
  generateSitemap(pages = [], articles = [], users = []) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Static Pages -->
  <url>
    <loc>${this.baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${this.baseUrl}/explore</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${this.baseUrl}/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${this.baseUrl}/register</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Articles -->
  ${articles.map(article => `
  <url>
    <loc>${this.baseUrl}/articles/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>${this.siteName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
      <news:title>${article.title}</news:title>
      <news:keywords>${article.tags?.join(', ') || ''}</news:keywords>
    </news:news>
    ${article.coverImage ? `
    <image:image>
      <image:loc>${this.baseUrl}/uploads/optimized/${article.coverImage}</image:loc>
      <image:title>${article.title}</image:title>
      <image:caption>${article.description}</image:caption>
    </image:image>` : ''}
  </url>`).join('')}

  <!-- User Profiles -->
  ${users.map(user => `
  <url>
    <loc>${this.baseUrl}/profile/${user.username}</loc>
    <lastmod>${new Date(user.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}

</urlset>`;

    return sitemap;
  }

  // Generate robots.txt
  generateRobotsTxt() {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/original/

# Allow public uploads
Allow: /uploads/optimized/
Allow: /uploads/webp/
Allow: /uploads/thumbnails/

# Crawl delay
Crawl-delay: 1`;
  }

  // Generate RSS feed
  generateRSSFeed(articles = []) {
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.siteName}</title>
    <link>${this.baseUrl}</link>
    <description>${this.siteDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${this.baseUrl}/articles/${article.slug}</link>
      <guid>${this.baseUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.description}]]></description>
      <author>${article.author?.name || article.author?.username}</author>
      <category>${article.category}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <lastmod>${new Date(article.updatedAt).toUTCString()}</lastmod>
    </item>`).join('')}
  </channel>
</rss>`;

    return rss;
  }

  // Save sitemap to file
  async saveSitemap(sitemap, filename = 'sitemap.xml') {
    try {
      const filePath = join(__dirname, '..', '..', 'public', filename);
      writeFileSync(filePath, sitemap, 'utf8');
      console.log(`✅ Sitemap saved: ${filename}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving sitemap:', error);
      return false;
    }
  }

  // Save robots.txt to file
  async saveRobotsTxt(robotsTxt) {
    try {
      const filePath = join(__dirname, '..', '..', 'public', 'robots.txt');
      writeFileSync(filePath, robotsTxt, 'utf8');
      console.log('✅ robots.txt saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving robots.txt:', error);
      return false;
    }
  }

  // Save RSS feed to file
  async saveRSSFeed(rssFeed, filename = 'rss.xml') {
    try {
      const filePath = join(__dirname, '..', '..', 'public', filename);
      writeFileSync(filePath, rssFeed, 'utf8');
      console.log(`✅ RSS feed saved: ${filename}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving RSS feed:', error);
      return false;
    }
  }

  // Generate meta tags HTML
  generateMetaTagsHTML(metaTags) {
    return Object.entries(metaTags)
      .map(([property, content]) => {
        if (!content) return '';
        
        if (property === 'title') {
          return `<title>${content}</title>`;
        }
        
        if (property.startsWith('og:')) {
          return `<meta property="${property}" content="${content}" />`;
        }
        
        if (property.startsWith('twitter:')) {
          return `<meta name="${property}" content="${content}" />`;
        }
        
        if (property === 'keywords' || property === 'description' || property === 'author') {
          return `<meta name="${property}" content="${content}" />`;
        }
        
        if (property === 'robots' || property === 'viewport' || property === 'theme-color') {
          return `<meta name="${property}" content="${content}" />`;
        }
        
        return '';
      })
      .filter(tag => tag !== '')
      .join('\n  ');
  }

  // Generate complete HTML head with meta tags
  generateHTMLHead(metaTags, structuredData = null) {
    const metaTagsHTML = this.generateMetaTagsHTML(metaTags);
    const structuredDataHTML = structuredData ? 
      `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${metaTagsHTML}
  ${structuredDataHTML}
  <link rel="canonical" href="${metaTags['og:url'] || this.baseUrl}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</head>`;
  }
}

export default new SEOService();
