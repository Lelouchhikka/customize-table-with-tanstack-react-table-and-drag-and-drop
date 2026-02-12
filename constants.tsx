
import React from 'react';
import { UserData } from './types';
import { ColumnDef } from '@tanstack/react-table';

export const DEFAULT_DATA: UserData[] = [
  { id: 1, name: 'Ivan Petrov', email: 'ivan@example.com', age: 28, status: 'Active', role: 'Frontend Engineer', lastLogin: '2023-10-24', progress: 85 },
  { id: 2, name: 'Daria Petrova', email: 'daria@example.com', age: 32, status: 'Pending', role: 'UX Designer', lastLogin: '2023-11-01', progress: 45 },
  { id: 3, name: 'Alex Smith', email: 'alex@example.com', age: 24, status: 'Active', role: 'DevOps', lastLogin: '2023-11-12', progress: 92 },
  { id: 4, name: 'Elena Korolyova', email: 'elena@example.com', age: 29, status: 'Inactive', role: 'Product Manager', lastLogin: '2023-09-15', progress: 12 },
  { id: 5, name: 'Michael Brown', email: 'mike@example.com', age: 41, status: 'Active', role: 'CTO', lastLogin: '2023-11-15', progress: 100 },
  { id: 6, name: 'Sarah Wilson', email: 'sarah@example.com', age: 27, status: 'Pending', role: 'QA Analyst', lastLogin: '2023-11-14', progress: 67 },
  { id: 7, name: 'John Doe', email: 'john@example.com', age: 35, status: 'Active', role: 'Backend Dev', lastLogin: '2023-11-10', progress: 80 },
  { id: 8, name: 'Anna Lee', email: 'anna@example.com', age: 22, status: 'Inactive', role: 'Intern', lastLogin: '2023-08-20', progress: 30 },
];

export const COLUMNS: ColumnDef<UserData, any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 60,
  },
  {
    accessorKey: 'name',
    header: 'Full Name',
    size: 180,
    cell: info => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    size: 150,
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
    size: 200,
  },
  {
    accessorKey: 'age',
    header: 'Age',
    size: 80,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: info => {
      const status = info.getValue();
      const colors = {
        Active: 'bg-green-100 text-green-700',
        Pending: 'bg-amber-100 text-amber-700',
        Inactive: 'bg-rose-100 text-rose-700',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    size: 140,
    cell: info => {
      const val = info.getValue();
      return (
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full" 
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-8">{val}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    size: 130,
  },
];
