
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  VisibilityState,
  ColumnSizingState,
  ColumnOrderState,
  Header,
  Table,
  RowSelectionState,
  ColumnDef,
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
import { 
  Eye, 
  EyeOff, 
  GripHorizontal, 
  GripVertical, 
  Settings2, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  X,
  CheckCircle2
} from 'lucide-react';
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

  const isSpecialColumn = header.column.id === 'actions';

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`group border-b border-r border-slate-200 p-0 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100/50 transition-colors ${
        isDragging ? 'bg-indigo-50 shadow-md ring-2 ring-indigo-500 ring-inset' : ''
      }`}
    >
      <div className="flex items-center gap-2 p-4 h-full relative">
        {!isSpecialColumn && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 p-1 -ml-1 rounded transition-colors"
          >
            <GripVertical size={14} />
          </button>
        )}
        <div className="flex-1 truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>

      {!isSpecialColumn && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
        />
      )}
    </th>
  );
};

export function CustomTable() {
  const [data, setData] = useState<UserData[]>(DEFAULT_DATA);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Persist column settings
  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>('table_visibility_v1', {});
  const [columnSizing, setColumnSizing] = useLocalStorage<ColumnSizingState>('table_sizing_v1', {});
  
  // Define columns: removed 'select' column as requested
  const tableColumns = useMemo<ColumnDef<UserData, any>[]>(() => [
    ...COLUMNS,
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection toggle
              console.log('Edit', row.original);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Row"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection toggle
              setData(prev => prev.filter(item => item.id !== row.original.id));
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Row"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }
  ], [data]);

  const [columnOrder, setColumnOrder] = useLocalStorage<ColumnOrderState>(
    'table_order_v1',
    tableColumns.map(c => (c.id || (c as any).accessorKey) as string)
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      columnVisibility,
      columnSizing,
      columnOrder,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  const selectedRowsCount = Object.keys(rowSelection).length;

  const handleBulkDelete = () => {
    const selectedIds = new Set(Object.keys(rowSelection));
    setData(prev => prev.filter(item => !selectedIds.has(item.id.toString())));
    setRowSelection({});
  };

  const resetTable = () => {
    setColumnVisibility({});
    setColumnSizing({});
    setColumnOrder(tableColumns.map(c => (c.id || (c as any).accessorKey) as string));
    setRowSelection({});
  };

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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Container */}
      <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[100px] flex items-center">
        {/* Default Header - Visible when nothing is selected */}
        <div className={`flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 transform ${selectedRowsCount > 0 ? 'opacity-0 -translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              Workspace Directory
            </h2>
            <p className="text-sm text-slate-500">Click a row to select. Drag headers to reorder.</p>
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

        {/* Bulk Actions Toolbar - Visible when rows are selected */}
        <div className={`absolute inset-0 flex items-center justify-between px-6 bg-indigo-600 text-white transition-all duration-500 transform ${selectedRowsCount > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setRowSelection({})}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2"
              title="Clear Selection"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-indigo-200" />
              <span className="font-semibold text-lg">{selectedRowsCount} items selected</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
              onClick={() => console.log('Bulk Edit', rowSelection)}
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-lg shadow-rose-900/30"
              onClick={handleBulkDelete}
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Column Control Menu */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-500 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              Columns:
            </div>
            <div className="flex gap-2">
              {table.getAllLeafColumns().filter(c => c.id !== 'actions').map(column => (
                <label 
                  key={column.id} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none
                    ${column.getIsVisible() ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}
                >
                  <input type="checkbox" className="hidden" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
                  {column.getIsVisible() ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="capitalize">{column.id.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto relative">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table style={{ width: table.getCenterTotalSize() }} className="border-collapse min-w-full table-fixed">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-slate-50/80">
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
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
                      onClick={() => row.toggleSelected()}
                      className={`cursor-pointer transition-colors group select-none ${row.getIsSelected() ? 'bg-indigo-50/70 hover:bg-indigo-100/70' : 'hover:bg-slate-50'}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          style={{ width: cell.column.getSize() }} 
                          className={`p-4 text-sm text-slate-600 border-r border-slate-50/50 whitespace-nowrap overflow-hidden text-ellipsis ${cell.column.id === 'actions' ? 'overflow-visible' : ''}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getVisibleLeafColumns().length} className="p-12 text-center text-slate-400 italic">
                      No matching records found.
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
            Total <span className="font-semibold text-slate-700">{data.length}</span> entries 
            {selectedRowsCount > 0 && ` • ${selectedRowsCount} selected`}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
               <span className="text-slate-400">Tip:</span>
               <span>Click any row to select</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
