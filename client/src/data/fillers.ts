export const THUMBS_COUNT = 10;
export const THUMBS_START = 3;

export const FILLER_IMAGES: { url: string; alt: string }[] = Array.from(
  { length: THUMBS_COUNT, },
  (_, i) => ({
    url: `/thumbs/${THUMBS_START + i}.png`,
    alt: "Placeholder car image",
  })
);