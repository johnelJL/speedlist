const assert = require('assert');
const {
  sanitizeImages,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_IMAGE_BYTES
} = require('./imageUtils');

function makeDataUrl(size) {
  const buffer = Buffer.alloc(size, 'a');
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

(() => {
  const smallImage = makeDataUrl(1024);
  const { images, error } = sanitizeImages([smallImage]);
  assert.strictEqual(error, undefined);
  assert.strictEqual(images.length, 1);
})();

(() => {
  const oversized = makeDataUrl(MAX_IMAGE_BYTES + 1);
  const { error } = sanitizeImages([oversized]);
  assert.ok(error?.includes('smaller'));
})();

(() => {
  const imageA = makeDataUrl(512 * 1024);
  const imageB = makeDataUrl(512 * 1024);
  const { error } = sanitizeImages([imageA, imageB], { maxTotalBytes: 512 * 1024 });
  assert.ok(error?.includes('total limit'));
})();

console.log('imageUtils tests passed:', {
  perImageLimit: `${(MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(1)}MB`,
  totalLimit: `${(MAX_TOTAL_IMAGE_BYTES / (1024 * 1024)).toFixed(1)}MB`
});
