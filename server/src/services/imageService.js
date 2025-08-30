import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class ImageService {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    this.uploadDir = join(__dirname, '..', '..', 'uploads');
    this.ensureUploadDirs();
  }

  async ensureUploadDirs() {
    const dirs = [
      this.uploadDir,
      join(this.uploadDir, 'original'),
      join(this.uploadDir, 'optimized'),
      join(this.uploadDir, 'thumbnails'),
      join(this.uploadDir, 'webp')
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  // Process uploaded image
  async processImage(file, options = {}) {
    const {
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1080,
      generateWebP = true,
      generateThumbnail = true,
      thumbnailSize = 300
    } = options;

    try {
      const originalPath = file.path;
      const filename = basename(file.filename, extname(file.filename));
      const timestamp = Date.now();

      // Generate optimized versions
      const results = {
        original: file.filename,
        optimized: null,
        webp: null,
        thumbnail: null
      };

      // Create optimized JPEG/PNG
      const optimizedFilename = `${filename}_opt_${timestamp}${extname(file.filename)}`;
      const optimizedPath = join(this.uploadDir, 'optimized', optimizedFilename);
      
      await sharp(originalPath)
        .resize(maxWidth, maxHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .png({ quality })
        .toFile(optimizedPath);

      results.optimized = optimizedFilename;

      // Generate WebP version
      if (generateWebP) {
        const webpFilename = `${filename}_${timestamp}.webp`;
        const webpPath = join(this.uploadDir, 'webp', webpFilename);
        
        await sharp(originalPath)
          .resize(maxWidth, maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ quality })
          .toFile(webpPath);

        results.webp = webpFilename;
      }

      // Generate thumbnail
      if (generateThumbnail) {
        const thumbnailFilename = `${filename}_thumb_${timestamp}${extname(file.filename)}`;
        const thumbnailPath = join(this.uploadDir, 'thumbnails', thumbnailFilename);
        
        await sharp(originalPath)
          .resize(thumbnailSize, thumbnailSize, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toFile(thumbnailPath);

        results.thumbnail = thumbnailFilename;
      }

      return results;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  // Generate responsive image sizes
  async generateResponsiveImages(file, sizes = [640, 768, 1024, 1280, 1920]) {
    const filename = basename(file.filename, extname(file.filename));
    const timestamp = Date.now();
    const results = {};

    try {
      for (const size of sizes) {
        const responsiveFilename = `${filename}_${size}w_${timestamp}${extname(file.filename)}`;
        const responsivePath = join(this.uploadDir, 'responsive', responsiveFilename);
        
        await sharp(file.path)
          .resize(size, null, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toFile(responsivePath);

        results[size] = responsiveFilename;
      }

      return results;
    } catch (error) {
      console.error('Error generating responsive images:', error);
      throw new Error('Failed to generate responsive images');
    }
  }

  // Convert image to WebP
  async convertToWebP(file, quality = 80) {
    try {
      const filename = basename(file.filename, extname(file.filename));
      const webpFilename = `${filename}.webp`;
      const webpPath = join(this.uploadDir, 'webp', webpFilename);

      await sharp(file.path)
        .webp({ quality })
        .toFile(webpPath);

      return webpFilename;
    } catch (error) {
      console.error('Error converting to WebP:', error);
      throw new Error('Failed to convert image to WebP');
    }
  }

  // Create image metadata
  async getImageMetadata(file) {
    try {
      const metadata = await sharp(file.path).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        hasProfile: metadata.hasProfile,
        isOpaque: metadata.isOpaque
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  // Generate image hash for caching
  async generateImageHash(file) {
    try {
      const buffer = await sharp(file.path)
        .resize(8, 8)
        .grayscale()
        .raw()
        .toBuffer();

      let hash = 0;
      for (let i = 0; i < buffer.length; i++) {
        hash = ((hash << 5) - hash + buffer[i]) & 0xffffffff;
      }
      
      return hash.toString(16);
    } catch (error) {
      console.error('Error generating image hash:', error);
      return null;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(files) {
    try {
      for (const file of files) {
        if (file.path && file.path !== file.originalname) {
          await fs.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get image URL
  getImageUrl(filename, type = 'optimized') {
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  // Generate srcset for responsive images
  generateSrcSet(responsiveImages, baseUrl) {
    return Object.entries(responsiveImages)
      .map(([size, filename]) => `${baseUrl}/uploads/responsive/${filename} ${size}w`)
      .join(', ');
  }

  // Generate picture element HTML
  generatePictureElement(originalImage, webpImage, responsiveImages, alt = '') {
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    let html = '<picture>';
    
    // WebP source
    if (webpImage) {
      html += `<source type="image/webp" srcset="${this.generateSrcSet(responsiveImages, baseUrl)}">`;
    }
    
    // Fallback image
    html += `<img src="${baseUrl}/uploads/optimized/${originalImage}" alt="${alt}" loading="lazy">`;
    html += '</picture>';
    
    return html;
  }

  // Validate image file
  validateImage(file) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('Image file too large. Maximum size is 10MB.');
    }

    return true;
  }
}

export default new ImageService();
