
export interface UserData {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'Active' | 'Pending' | 'Inactive';
  role: string;
  lastLogin: string;
  progress: number;
}

export interface TableStatePersistence {
  columnVisibility: Record<string, boolean>;
  columnSizing: Record<string, number>;
}
