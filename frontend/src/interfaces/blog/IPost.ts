import { IUser } from '../auth/IUser';
import { ICategory, ICategoryList } from './ICategory';
import { IHeading } from './IHeading';

export interface IPostUser {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export interface IPost {
  id: string;
  user: IPostUser;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  keywords: string;
  slug: string;
  category: ICategory;
  created_at: string;
  updated_at: string;
  update_at?: string;
  status: string;
  headings: IHeading[];
  view_count: number;
  comments_count: number;
  has_liked: boolean;
  likes_count: number;
  featured?: boolean;
}

export interface IRecentComment {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface IPostsList {
  id: string;
  title: string;
  /** API devuelve update_at (Django); usar este o updated_at */
  update_at?: string;
  updated_at?: string;
  created_at: string;
  description: string;
  thumbnail: string;
  slug: string;
  category: ICategoryList;
  view_count: number | string;
  likes_count: number;
  has_liked: boolean;
  comments_count?: number;
  recent_comments?: IRecentComment[];
  user: IUser;
  status: string;
}
