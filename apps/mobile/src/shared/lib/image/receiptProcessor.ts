import ImageResizer from 'react-native-image-resizer';

export class ReceiptTooLargeError extends Error {
  constructor(message = 'Receipt image exceeds Firestore safe document size limit') {
    super(message);
    this.name = 'ReceiptTooLargeError';
  }
}

export interface ProcessedReceipt {
  originalUri: string;
  resizedUri: string;
  base64Data: string;
  sizeBytes: number;
}

const MAX_DOCUMENT_BYTES = 850 * 1024;
const INITIAL_QUALITY = 75;
const FALLBACK_QUALITY = 50;
const MAX_DIMENSION = 800;

export async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Index = result.indexOf('base64,');
      if (base64Index !== -1) {
        resolve(result.substring(base64Index + 7));
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert image to base64'));
    };
    reader.readAsDataURL(blob);
  });
}

export async function processReceiptImage(
  sourceUri: string
): Promise<ProcessedReceipt> {
  let resized = await ImageResizer.createResizedImage(
    sourceUri,
    MAX_DIMENSION,
    MAX_DIMENSION,
    'JPEG',
    INITIAL_QUALITY,
    0,
    undefined,
    false,
    { mode: 'contain', onlyScaleDown: true }
  );

  let base64Data = await uriToBase64(resized.uri);
  let sizeBytes = Math.round((base64Data.length * 3) / 4);

  if (sizeBytes > MAX_DOCUMENT_BYTES) {
    resized = await ImageResizer.createResizedImage(
      sourceUri,
      MAX_DIMENSION,
      MAX_DIMENSION,
      'JPEG',
      FALLBACK_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true }
    );

    base64Data = await uriToBase64(resized.uri);
    sizeBytes = Math.round((base64Data.length * 3) / 4);

    if (sizeBytes > MAX_DOCUMENT_BYTES) {
      throw new ReceiptTooLargeError(
        `Receipt image size (${(sizeBytes / 1024).toFixed(0)}KB) exceeds the 850KB Firestore limit`
      );
    }
  }

  return {
    originalUri: sourceUri,
    resizedUri: resized.uri,
    base64Data,
    sizeBytes,
  };
}
