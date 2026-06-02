export interface Post {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  coverImage: string;
  date: string;
  likes: number;
  views: number;
  tags: string[];
  category: string;
  categoryEn: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  nickname: string;
  email: string;
  content: string; // HTML string from our custom WYSIWYG editor
  avatar: string;
  date: string;
  replyTo?: string; // nickname of the person being replied to
  isHidden?: boolean; // toggle visibility state of comments
}

export interface Category {
  name: string;
  nameEn: string;
  count: number;
}

export interface Tag {
  name: string;
  count: number;
}

export interface Archive {
  yearMonth: string; // e.g. "2026-05"
  label: string;      // e.g. "2026年5月"
  labelEn: string;    // e.g. "May 2026"
  count: number;
}

export interface UserStats {
  articleCount: number;
  commentCount: number;
  visitCount: number;
}

export interface Slide {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  postId: string;
}
