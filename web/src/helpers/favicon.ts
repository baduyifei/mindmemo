const FAVICON_SIZE = 256;
const MAX_FAVICON_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_FAVICON_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const validateFaviconFile = (file: File) => {
  if (!SUPPORTED_FAVICON_TYPES.has(file.type)) {
    throw new Error("unsupported-file-type");
  }
  if (file.size > MAX_FAVICON_FILE_SIZE) {
    throw new Error("file-too-large");
  }
};

export const createCircularFavicon = async (file: File): Promise<string> => {
  validateFaviconFile(file);

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imageElement = new Image();
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = () => reject(new Error("invalid-image"));
      imageElement.src = objectUrl;
    });

    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    if (sourceSize === 0) {
      throw new Error("invalid-image");
    }

    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("canvas-unavailable");
    }

    context.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE);
    context.beginPath();
    context.arc(FAVICON_SIZE / 2, FAVICON_SIZE / 2, FAVICON_SIZE / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, FAVICON_SIZE, FAVICON_SIZE);

    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
