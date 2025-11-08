// Image Preprocessing Utility - Convert color images to grayscale/black & white for better OCR
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Preprocess image: Convert to grayscale and enhance contrast for better OCR
 * This improves OCR accuracy for colored/scanned PDFs
 * @param {string} imagePath - Path to the original image
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise<string>} - Path to the preprocessed image
 */
async function preprocessImageForOCR(imagePath, timeoutMs = 10000) {
  try {
    // Check if file exists
    await fs.access(imagePath);

    // Get file extension
    const ext = path.extname(imagePath).toLowerCase();
    const isPDF = ext === '.pdf';

    // Skip PDFs (they're handled separately)
    if (isPDF) {
      return imagePath;
    }

    // Check file size - skip preprocessing for very large files to avoid hanging
    const stats = await fs.stat(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Skip preprocessing for files larger than 5MB to prevent hanging
    if (fileSizeMB > 5) {
      console.log(`⚠️ File too large (${fileSizeMB.toFixed(1)}MB), skipping preprocessing`);
      return imagePath;
    }

    console.log('🖼️ Preprocessing image for better OCR:', path.basename(imagePath));

    // Create output path for preprocessed image
    const dir = path.dirname(imagePath);
    const basename = path.basename(imagePath, ext);
    const preprocessedPath = path.join(dir, `${basename}_preprocessed${ext}`);

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Image preprocessing timeout')), timeoutMs);
    });

    // Use Sharp to convert to grayscale and enhance contrast
    const processPromise = sharp(imagePath)
      .greyscale() // Convert to grayscale (removes color)
      .normalize() // Enhance contrast
      .sharpen() // Sharpen edges for better text recognition
      .toFile(preprocessedPath);

    await Promise.race([processPromise, timeoutPromise]);

    console.log('✅ Image preprocessed: Color → Grayscale + Enhanced');

    return preprocessedPath;
  } catch (error) {
    if (error.message === 'Image preprocessing timeout') {
      console.warn('⚠️ Image preprocessing timed out, using original image');
    } else {
      console.warn('⚠️ Image preprocessing failed, using original:', error.message);
    }
    // Return original path if preprocessing fails
    return imagePath;
  }
}

/**
 * Clean up preprocessed temporary files
 * @param {string} preprocessedPath - Path to the preprocessed image
 */
async function cleanupPreprocessedImage(preprocessedPath) {
  try {
    // Only delete if it's a preprocessed file (has _preprocessed in name)
    if (preprocessedPath.includes('_preprocessed')) {
      await fs.unlink(preprocessedPath);
      console.log('🧹 Cleaned up preprocessed image');
    }
  } catch (error) {
    // Ignore cleanup errors
    console.warn('⚠️ Could not cleanup preprocessed image:', error.message);
  }
}

module.exports = {
  preprocessImageForOCR,
  cleanupPreprocessedImage
};
