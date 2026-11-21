const MAX_IMAGE_DIMENSION = 800;
const TARGET_QUALITY = 0.84;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('تعذر قراءة ملف الصورة.'));
      }
    };
    reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الصورة.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر تحميل معاينة الصورة.'));
    img.src = src;
  });
}

/**
 * Converts a user-selected image File into a compact Data URL safe for localStorage persistence.
 */
export async function processUploadedProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('يرجى اختيار ملف صورة صالح (PNG أو JPG أو WEBP).');
  }

  // Max 12 MB raw input guard
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً (الحد الأقصى 12 ميغابايت).');
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  // Preserve SVGs or small images directly if canvas isn't needed
  if (file.type === 'image/svg+xml' || rawDataUrl.length < 90_000) {
    return rawDataUrl;
  }

  try {
    const img = await loadImageElement(rawDataUrl);
    const maxSide = Math.max(img.naturalWidth, img.naturalHeight);
    const scale =
      maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;
    const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return rawDataUrl;
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const preferAlpha = file.type === 'image/png' || file.type === 'image/webp';
    const mimeType = preferAlpha ? 'image/webp' : 'image/jpeg';
    const compressed = canvas.toDataURL(mimeType, TARGET_QUALITY);

    return compressed.length < rawDataUrl.length ? compressed : rawDataUrl;
  } catch {
    return rawDataUrl;
  }
}
