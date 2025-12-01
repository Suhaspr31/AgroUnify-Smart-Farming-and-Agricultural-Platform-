const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../core/logger');

class ImageService {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
    this.qualitySettings = {
      thumbnail: { width: 150, height: 150, quality: 80 },
      medium: { width: 400, height: 400, quality: 85 },
      large: { width: 800, height: 800, quality: 90 },
      original: { quality: 95 }
    };
  }

  // Process and optimize uploaded images
  async processProductImage(inputPath, outputDir, filename) {
    try {
      const results = {};

      // Create different sizes
      for (const [size, settings] of Object.entries(this.qualitySettings)) {
        const outputFilename = `${filename}_${size}`;
        const outputPath = path.join(outputDir, outputFilename);

        let pipeline = sharp(inputPath);

        if (size !== 'original') {
          pipeline = pipeline.resize(settings.width, settings.height, {
            fit: 'cover',
            position: 'center'
          });
        }

        // Convert to WebP for better compression
        const webpPath = `${outputPath}.webp`;
        await pipeline
          .webp({ quality: settings.quality })
          .toFile(webpPath);

        // Also create JPEG fallback
        const jpegPath = `${outputPath}.jpg`;
        await pipeline
          .jpeg({ quality: settings.quality })
          .toFile(jpegPath);

        results[size] = {
          webp: webpPath,
          jpeg: jpegPath
        };
      }

      // Clean up original file
      await fs.unlink(inputPath);

      return results;
    } catch (error) {
      logger.error('Error processing product image:', error);
      throw error;
    }
  }

  // Generate image URLs for different sizes
  generateImageUrls(baseUrl, filename, sizes) {
    const urls = {};

    for (const [size, paths] of Object.entries(sizes)) {
      urls[size] = {
        webp: `${baseUrl}/${path.basename(paths.webp)}`,
        jpeg: `${baseUrl}/${path.basename(paths.jpeg)}`
      };
    }

    return urls;
  }

  // Compress image for faster loading
  async compressImage(inputPath, outputPath, quality = 85) {
    try {
      const inputBuffer = await fs.readFile(inputPath);
      const metadata = await sharp(inputBuffer).metadata();

      let pipeline = sharp(inputBuffer);

      // Apply compression based on format
      if (metadata.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      } else if (metadata.format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 6 });
      } else if (metadata.format === 'webp') {
        pipeline = pipeline.webp({ quality });
      }

      await pipeline.toFile(outputPath);

      // Calculate compression ratio
      const originalSize = (await fs.stat(inputPath)).size;
      const compressedSize = (await fs.stat(outputPath)).size;
      const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      return {
        originalSize,
        compressedSize,
        compressionRatio: ratio,
        format: metadata.format
      };
    } catch (error) {
      logger.error('Error compressing image:', error);
      throw error;
    }
  }

  // Extract product information from image using OCR (placeholder)
  async extractProductInfo(imagePath) {
    try {
      // This would integrate with OCR services like Google Vision AI or Tesseract
      // For now, return placeholder data
      const extractedInfo = {
        text: '',
        productName: null,
        specifications: {},
        confidence: 0
      };

      // Placeholder OCR logic
      const metadata = await sharp(imagePath).metadata();

      // In a real implementation, you would:
      // 1. Use Tesseract.js or Google Vision API
      // 2. Extract text from product labels
      // 3. Parse specifications, ingredients, etc.
      // 4. Return structured data

      return extractedInfo;
    } catch (error) {
      logger.error('Error extracting product info:', error);
      return { text: '', productName: null, specifications: {}, confidence: 0 };
    }
  }

  // Generate image alt text using AI (placeholder)
  async generateAltText(imagePath, productInfo = {}) {
    try {
      // This would integrate with AI services like OpenAI Vision or similar
      // For now, generate basic alt text based on product info

      const { name, category, brand } = productInfo;
      let altText = 'Product image';

      if (name) altText = `${name} product image`;
      if (category) altText += ` - ${category}`;
      if (brand) altText = `${brand} ${altText}`;

      return altText;
    } catch (error) {
      logger.error('Error generating alt text:', error);
      return 'Product image';
    }
  }

  // Batch process images for catalog automation
  async processCatalogImages(imagePaths, outputDir) {
    try {
      const results = [];

      for (const imagePath of imagePaths) {
        const filename = path.basename(imagePath, path.extname(imagePath));
        const processedImages = await this.processProductImage(imagePath, outputDir, filename);

        // Extract product information
        const extractedInfo = await this.extractProductInfo(imagePath);

        results.push({
          originalPath: imagePath,
          processedImages,
          extractedInfo,
          filename
        });
      }

      return results;
    } catch (error) {
      logger.error('Error processing catalog images:', error);
      throw error;
    }
  }

  // Validate image before processing
  async validateImage(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();

      // Check file size (max 10MB)
      const stats = await fs.stat(imagePath);
      if (stats.size > 10 * 1024 * 1024) {
        throw new Error('Image file size exceeds 10MB limit');
      }

      // Check dimensions (max 4096x4096)
      if (metadata.width > 4096 || metadata.height > 4096) {
        throw new Error('Image dimensions exceed 4096x4096 limit');
      }

      // Check format
      if (!this.supportedFormats.includes(metadata.format)) {
        throw new Error(`Unsupported image format: ${metadata.format}`);
      }

      return {
        valid: true,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: stats.size
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Create image collage for product comparison
  async createImageCollage(imagePaths, outputPath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        columns = 2,
        spacing = 10
      } = options;

      const images = await Promise.all(
        imagePaths.map(async (imgPath) => {
          const buffer = await fs.readFile(imgPath);
          return { buffer, path: imgPath };
        })
      );

      // Calculate individual image dimensions
      const itemWidth = (width - (spacing * (columns - 1))) / columns;
      const itemHeight = (height - (spacing * (Math.ceil(images.length / columns) - 1))) / Math.ceil(images.length / columns);

      const compositeOperations = [];

      images.forEach((image, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        const x = col * (itemWidth + spacing);
        const y = row * (itemHeight + spacing);

        compositeOperations.push({
          input: image.buffer,
          top: Math.round(y),
          left: Math.round(x)
        });
      });

      // Create base canvas
      const canvas = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      });

      await canvas
        .composite(compositeOperations)
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      return {
        outputPath,
        dimensions: { width, height },
        imageCount: images.length
      };
    } catch (error) {
      logger.error('Error creating image collage:', error);
      throw error;
    }
  }

  // Optimize images for different devices
  async generateResponsiveImages(inputPath, outputDir, filename) {
    try {
      const breakpoints = {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        large: 1200
      };

      const results = {};

      for (const [device, width] of Object.entries(breakpoints)) {
        const outputPath = path.join(outputDir, `${filename}_${device}.webp`);

        await sharp(inputPath)
          .resize(width, null, {
            fit: 'cover',
            position: 'center',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        results[device] = outputPath;
      }

      return results;
    } catch (error) {
      logger.error('Error generating responsive images:', error);
      throw error;
    }
  }

  // Clean up old/unused images
  async cleanupUnusedImages(imageDir, usedImages, dryRun = true) {
    try {
      const files = await fs.readdir(imageDir);
      const usedFilenames = new Set(usedImages.map(img => path.basename(img)));
      const unusedFiles = files.filter(file => !usedFilenames.has(file));

      const results = {
        totalFiles: files.length,
        usedFiles: usedFilenames.size,
        unusedFiles: unusedFiles.length,
        deletedFiles: []
      };

      if (!dryRun) {
        for (const file of unusedFiles) {
          const filePath = path.join(imageDir, file);
          await fs.unlink(filePath);
          results.deletedFiles.push(file);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error cleaning up unused images:', error);
      throw error;
    }
  }
}

module.exports = new ImageService();