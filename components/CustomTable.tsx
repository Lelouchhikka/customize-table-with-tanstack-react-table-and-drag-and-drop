
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  VisibilityState,
  ColumnSizingState,
  ColumnOrderState,
  Header,
  Table,
} from '@tanstack/react-table';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DEFAULT_DATA, COLUMNS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Eye, EyeOff, GripHorizontal, GripVertical, Settings2, RotateCcw } from 'lucide-react';
import { UserData } from '../types';

// Draggable Header Component
interface DraggableHeaderProps {
  header: Header<UserData, any>;
  table: Table<UserData>;
}

const DraggableHeader: React.FC<DraggableHeaderProps> = ({ header, table }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: header.column.id,
    });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`group border-b border-r border-slate-200 p-0 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100/50 transition-colors ${
        isDragging ? 'bg-indigo-50 shadow-md ring-2 ring-indigo-500 ring-inset' : ''
      }`}
    >
      <div className="flex items-center gap-2 p-4 h-full relative">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 p-1 -ml-1 rounded transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>

      {/* Resizer Handle */}
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
      />
    </th>
  );
};

export function CustomTable() {
  const [data] = React.useState(DEFAULT_DATA);

  // Persist column settings
  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
    'table_visibility_v1',
    {}
  );
  const [columnSizing, setColumnSizing] = useLocalStorage<ColumnSizingState>(
    'table_sizing_v1',
    {}
  );
  const [columnOrder, setColumnOrder] = useLocalStorage<ColumnOrderState>(
    'table_order_v1',
    // Fix: accessorKey is not on all members of ColumnDef union, cast to any since we know our constants use it
    COLUMNS.map(c => (c as any).accessorKey as string)
  );

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: {
      columnVisibility,
      columnSizing,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
  });

  const resetTable = () => {
    setColumnVisibility({});
    setColumnSizing({});
    // Fix: accessorKey is not on all members of ColumnDef union, cast to any since we know our constants use it
    setColumnOrder(COLUMNS.map(c => (c as any).accessorKey as string));
  };

  // Reordering logic for DND
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(active.id as string);
        const newIndex = prevOrder.indexOf(over.id as string);
        return arrayMove(prevOrder, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            Workspace Directory
          </h2>
          <p className="text-sm text-slate-500">Manage team members and reorder columns by dragging handles.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={resetTable}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Layout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Column Control Menu */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              Toggle Columns:
            </div>
            <div className="flex gap-2">
              {table.getAllLeafColumns().map(column => (
                <label 
                  key={column.id} 
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-all select-none
                    ${column.getIsVisible() 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                      : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  {column.getIsVisible() ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="capitalize">{column.id.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container with DND context */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table 
              style={{ width: table.getCenterTotalSize() }} 
              className="border-collapse min-w-full"
            >
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-slate-50/80">
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map(header => (
                        <DraggableHeader key={header.id} header={header} table={table} />
                      ))}
                    </SortableContext>
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          style={{ width: cell.column.getSize() }} 
                          className="p-4 text-sm text-slate-600 border-r border-slate-50/50 whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getVisibleLeafColumns().length} className="p-12 text-center text-slate-400 italic">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{table.getRowModel().rows.length}</span> team members
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
               <GripVertical className="w-4 h-4 opacity-30" />
               <span>Drag headers to reorder</span>
             </div>
             <div className="flex items-center gap-1">
               <GripHorizontal className="w-4 h-4 opacity-30" />
               <span>Resize handles on column edges</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
