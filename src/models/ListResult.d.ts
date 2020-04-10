export type ListResult<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: SortStatus;
  totalElements: number;
  totalPages: number;
}

type SortStatus = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}