const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB per image
const MAX_TOTAL_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB across all images
const MAX_IMAGES = 4;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function estimateDataUrlBytes(dataUrl) {
  const base64Part = (dataUrl || '').split(',')[1] || '';
  try {
    return Buffer.byteLength(base64Part, 'base64');
  } catch (error) {
    return Infinity;
  }
}

function sanitizeImages(images, options = {}) {
  const maxImages = Number.isFinite(options.maxImages) ? options.maxImages : MAX_IMAGES;
  const maxPerImageBytes = Number.isFinite(options.maxPerImageBytes)
    ? options.maxPerImageBytes
    : MAX_IMAGE_BYTES;
  const maxTotalBytes = Number.isFinite(options.maxTotalBytes)
    ? options.maxTotalBytes
    : MAX_TOTAL_IMAGE_BYTES;

  const validImages = [];
  let totalBytes = 0;

  for (const img of Array.isArray(images) ? images : []) {
    if (typeof img !== 'string' || !img.startsWith('data:image/')) continue;
    const bytes = estimateDataUrlBytes(img);
    if (!Number.isFinite(bytes)) {
      return { images: [], error: 'Invalid image data provided.' };
    }

    if (bytes > maxPerImageBytes) {
      return {
        images: [],
        error: `Each image must be smaller than ${formatBytes(maxPerImageBytes)}.`
      };
    }

    if (totalBytes + bytes > maxTotalBytes) {
      return {
        images: [],
        error: `Images exceed the total limit of ${formatBytes(maxTotalBytes)}.`
      };
    }

    validImages.push(img);
    totalBytes += bytes;
    if (validImages.length >= maxImages) break;
  }

  return { images: validImages, totalBytes };
}

module.exports = {
  sanitizeImages,
  estimateDataUrlBytes,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
  MAX_IMAGES
};
