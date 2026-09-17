export type PublicPostCategoryId = 'all' | 'diary' | 'travelogue';

export interface PublicPostCategoryQuery {
  contentLevel?: string;
  postType?: string;
  postTypes?: string[];
  excludeContentLevels?: string[];
}

export interface PublicPostCategory {
  id: PublicPostCategoryId;
  label: string;
  query: PublicPostCategoryQuery;
}

export const PUBLIC_POST_CATEGORIES: PublicPostCategory[] = [
  { id: 'all', label: '全部', query: { contentLevel: 'DIARY,TRAVELOGUE,ESSAY' } },
  { id: 'diary', label: '日记', query: { contentLevel: 'DIARY' } },
  { id: 'travelogue', label: '游记', query: { contentLevel: 'TRAVELOGUE,ESSAY' } },
];

export const PUBLIC_POST_CATEGORY_LABELS = Object.fromEntries(
  PUBLIC_POST_CATEGORIES.map((category) => [category.id, category.label]),
) as Record<PublicPostCategoryId, string>;

export function getPublicPostCategory(id: string): PublicPostCategory {
  return PUBLIC_POST_CATEGORIES.find((category) => category.id === id) ?? PUBLIC_POST_CATEGORIES[0];
}
