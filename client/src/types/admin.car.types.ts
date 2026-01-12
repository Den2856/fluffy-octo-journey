export type CarGalleryItem = {
  url: string;
  alt?: string;
};

export type CarChips = {
  seats?: number;
  horsepower?: number;
  transmission?: string;
  fuel?: string;
};

export type CarSpecs = {
  acceleration0to100Sec?: number;
  drivetrain?: string;
  transmissionDetail?: string;
  engine?: string;
};

export type OverviewBlock = {
  title: string;
  text: string;
};

export type Car = {
  _id: string;

  make?: string;
  model?: string;
  trim?: string;
  slug: string;

  badge?: string;
  type?: string;
  seats?: number;

  isActive: boolean;
  isFeatured: boolean;

  pricePerDay?: number;
  currency?: string;

  thumbnailUrl?: string;
  gallery?: CarGalleryItem[];

  chips?: CarChips;
  specs?: CarSpecs;
  overviewBlocks?: OverviewBlock[];

  createdAt?: string;
  updatedAt?: string;
};

export type CarUpsertPayload = Partial<Omit<Car, "_id">>;