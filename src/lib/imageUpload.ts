import { LIMITS } from './validation';

const MAX_BYTES = LIMITS.PRODUCT_IMAGE_MAX - 2000;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ছবিটি লোড করা যায়নি। অনুগ্রহ করে সঠিক JPG/PNG/WebP ফাইল দিন।'));
    };
    img.src = objectUrl;
  });
}

/**
 * Resizes and compresses a product image into an optimized JPEG data URL
 * guaranteed to fit within Firestore's PRODUCT_IMAGE_MAX boundary.
 */
export async function compressProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
  }

  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ব্রাউজারে ছবি প্রসেস করা সম্ভব হয়নি।');
  }

  const dimensionSteps = [640, 520, 400];
  const qualitySteps = [0.8, 0.68, 0.56, 0.44];

  for (const maxWidth of dimensionSteps) {
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

    canvas.width = targetW;
    canvas.height = targetH;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    for (const quality of qualitySteps) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= MAX_BYTES) {
        return dataUrl;
      }
    }
  }

  throw new Error('ছবির আকার অনেক বড়। অনুগ্রহ করে ছোট আকারের ছবি নির্বাচন করুন।');
}
