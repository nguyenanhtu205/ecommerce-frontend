export type CategoryItem = {
  id: string;
  name: string;
  image: string | null;
  slug: string;
  parentId: string | null;
  path: {
    id: string;
    name: string;
  }[];
  level: number;
  isLeaf: boolean;
};
