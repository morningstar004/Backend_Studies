const getDominantColor = (src) => {
  if (!src) return Promise.resolve("hsl(210 80% 60%)");

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 36;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        const colorBuckets = new Map();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const saturation = max === 0 ? 0 : delta / max;
          const brightness = max / 255;

          if (saturation < 0.12 || brightness < 0.12 || brightness > 0.96)
            continue;

          const bucket = `${Math.round(r / 32) * 32}-${Math.round(g / 32) * 32}-${Math.round(b / 32) * 32}`;
          const weight = 0.5 + saturation;
          const existing = colorBuckets.get(bucket) || {
            weight: 0,
            r: 0,
            g: 0,
            b: 0,
          };

          existing.weight += weight;
          existing.r += r * weight;
          existing.g += g * weight;
          existing.b += b * weight;
          colorBuckets.set(bucket, existing);
        }

        let dominantColor;

        colorBuckets.forEach((color) => {
          if (!dominantColor || color.weight > dominantColor.weight) {
            dominantColor = color;
          }
        });

        if (!dominantColor) {
          resolve("hsl(32 85% 60%)");
          return;
        }

        const { weight, r, g, b } = dominantColor;
        resolve(
          `rgb(${Math.round(r / weight)} ${Math.round(g / weight)} ${Math.round(b / weight)})`,
        );
      } catch {
        resolve("hsl(210 80% 60%)");
      }
    };

    img.onerror = () => resolve("hsl(210 80% 60%)");
    img.src = src;
  });
};

export default getDominantColor;
