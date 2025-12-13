const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB per image
const MAX_TOTAL_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB across all images
const MAX_IMAGES = 4;

let sharpPromise;

async function loadSharp() {
  if (!sharpPromise) {
    sharpPromise = import('sharp')
      .then((mod) => mod.default || mod)
      .catch((error) => {
        console.warn('Image compression disabled; sharp could not be loaded', error?.message || error);
        return null;
      });
  }

  return sharpPromise;
}

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

async function compressImageDataUrl(dataUrl, options = {}) {
  const { maxWidth = 1280, maxHeight = 1280, quality = 72 } = options;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return dataUrl;

  const [header, base64Data] = dataUrl.split(',');
  if (!base64Data) return dataUrl;

  try {
    const sharp = await loadSharp();
    if (!sharp) return dataUrl;

    const inputBuffer = Buffer.from(base64Data, 'base64');
    const processed = await sharp(inputBuffer)
      .rotate()
      .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${processed.toString('base64')}`;
  } catch (error) {
    console.warn('Failed to compress image, using original', error);
    return dataUrl;
  }
}

async function compressImages(images = [], options = {}) {
  const optimized = [];

  for (const img of Array.isArray(images) ? images : []) {
    optimized.push(await compressImageDataUrl(img, options));
  }

  return optimized;
}

module.exports = {
  sanitizeImages,
  estimateDataUrlBytes,
  compressImages,
  compressImageDataUrl,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
  MAX_IMAGES
};
