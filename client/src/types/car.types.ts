export type CarCardDTO = {
  _id: string;
  make: string;
  model: string;
  trim?: string;
  slug: string;

  badge?: string;
  isFeatured: boolean;

  pricePerDay: number;
  currency: string;

  thumbnailUrl: string;
  gallery: GalleryItem[];

  chips?: {
    seats?: number;
    horsepower?: number;
    transmission?: string;
    fuel?: string;
  };
};

type GalleryItem = {
  url: string
  alt?: string
}