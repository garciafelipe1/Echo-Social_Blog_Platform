export interface ICategory {
  parent: ICategory | null;
  name: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
}

export interface ICategoryList {
  name: string;
  slug: string;
  thumbnail: string;
}