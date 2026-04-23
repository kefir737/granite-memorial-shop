import Compressor from 'compressorjs';

export function compressImage(file: File, maxWidth = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth,
      maxHeight: maxWidth,
      convertSize: 1024 * 1024,
      success(result) {
        resolve(result instanceof File ? result : new File([result], file.name, { type: result.type }));
      },
      error: reject,
    });
  });
}
