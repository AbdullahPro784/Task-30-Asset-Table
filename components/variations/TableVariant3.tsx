"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";
import { StatusEditableCell } from "../Cell/StatusEditableCell";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, MoreHorizontal, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Asset, DATA } from "@/utils/data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "../Header/TableHeader";
import { DraggableRow } from "../Row/TableRow";
import { EditableCell } from "../Cell/CellEditor";
import Link from "next/link";
import { COMMON_COLUMNS_CONFIG } from "./column-config";
import { SubDetailView } from "./Variant3Components";
import { usePersistedData, useTableUIState, useTableDragDrop } from "../../hooks";
import { RowDragHandle } from "@/components/Row/DragHandleContext";

export default function TableVariant3({ data: initialData }: { data: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const uniqueCategories = useMemo(() => Array.from(new Set(DATA.map(item => item.category))).sort(), []);

    // Custom Hooks
    const [data, setData] = usePersistedData(initialData, "v3");
    const uiState = useTableUIState("v3", ["drag-handle", "select", "id", "serial", "category", "brand", "type", "vehicle", "status"]);
    // V3 uses flat list for main table, so we use 'flat' mode for DnD if strict or just rely on 'nested' which handles same-parent checks.
    // 'nested' logic I wrote also handles top-level reorder fine.
    const { sensors, activeId, activeItem, handleDragStart, handleDragEnd, handleDragOver, dragState } = useTableDragDrop(data, setData, uiState.setColumnOrder, 'nested');

    // V3 Specific Helpers
    const handleAddSubItem = (parentId: string) => {
        setData(prev => prev.map(item => {
            if (item.id === parentId) {
                const newSub: Asset = { id: `${parentId}-sub-${Date.now()}`, serial: `NEW-${Math.floor(Math.random() * 1000)}`, category: "New Task", brand: "-", type: "Task", vehicle: "-", status: { state: "operational", level: 1 }, endDate: new Date().toISOString().split('T')[0] };
                return { ...item, subRows: item.subRows ? [...item.subRows, newSub] : [newSub] };
            }
            return item;
        }));
    };
    const handleUpdateSubItem = (parentId: string, subId: string, field: keyof Asset, val: string) => {
        setData(prev => prev.map(item => {
            if (item.id === parentId && item.subRows) return { ...item, subRows: item.subRows.map(s => s.id === subId ? { ...s, [field]: val } : s) };
            return item;
        }));
    };

    const columns = useMemo<ColumnDef<Asset>[]>(() => [
        {
            id: "drag-handle",
            header: "",
            size: 40,
            enableSorting: false,
            enableResizing: false,
            cell: () => <RowDragHandle />,
        },
        {
            id: "select",
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
            cell: ({ row }) => {
                const hasSubRows = row.original.subRows && row.original.subRows.length > 0;
                return (
                    <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
                        {hasSubRows ? <button onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }} className={cn("p-1 rounded cursor-pointer transition-colors", row.getIsExpanded() ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-500")}>{row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button> : <div className="w-6" />}
                    </div>
                )
            },
            enableSorting: false, enableHiding: false, size: 80,
        },
        { accessorKey: "id", header: "Asset ID", size: 100, cell: (info) => <div className="px-4 py-3 h-full font-medium">{info.getValue() as string}</div> },
        ...COMMON_COLUMNS_CONFIG.filter(c => c.accessorKey !== 'vehicle').map(col => ({
            accessorKey: col.accessorKey, header: col.header, size: col.size,
            cell: (props: any) => col.type === 'select' ? <EditableCell {...props} options={uniqueCategories} /> : col.type === 'date' ? <EditableCell {...props} type="date" /> : <EditableCell {...props} />
        })),
        {
            accessorKey: "vehicle", header: "Vehicle", size: 140,
            cell: ({ row, getValue, table }) => {
                const rawValue = getValue() as string;

                // Parse the value to separate the status
                let displayValue = rawValue;
                let statusBadge = null;

                if (rawValue?.includes("(Checked)")) {
                    displayValue = rawValue.replace("(Checked)", "").trim();
                    statusBadge = (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Checked
                        </span>
                    );
                } else if (rawValue?.includes("Driver:")) {
                    statusBadge = (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            👤 Assigned
                        </span>
                    );
                }

                const handleAssignDriver = () => {
                    const driverName = prompt("Enter Driver Name:", "John Doe");
                    if (driverName) {
                        table.options.meta?.updateData(row.index, "vehicle", `Driver: ${driverName}`);
                    }
                };
                const handleCheckHistory = () => {
                    // Ensure we don't double append
                    const cleanValue = rawValue?.replace("(Checked)", "").trim();
                    table.options.meta?.updateData(row.index, "vehicle", `${cleanValue} (Checked)`);
                };
                return (
                    <div className="flex items-center justify-between px-4 py-3 h-full group">
                        <div className="flex items-center truncate">
                            <span className="truncate" title={displayValue}>{displayValue || "-"}</span>
                            {statusBadge}
                        </div>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleAssignDriver}>
                                    Assign Driver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCheckHistory}>
                                    Check History
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
        { accessorKey: "status", header: "Status", size: 180, cell: StatusEditableCell },
    ], [uniqueCategories]);

    const table = useReactTable({
        data, columns, getRowId: (row) => row.id,
        state: uiState,
        onSortingChange: uiState.setSorting, onColumnFiltersChange: uiState.setColumnFilters, onGlobalFilterChange: uiState.setGlobalFilter,
        onColumnVisibilityChange: uiState.setColumnVisibility, onColumnOrderChange: uiState.setColumnOrder, onRowSelectionChange: uiState.setRowSelection,
        onColumnSizingChange: uiState.setColumnSizing, onExpandedChange: uiState.setExpanded,
        getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
        getSubRows: undefined, // Force flat list for V3
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false, enableRowSelection: true, enableMultiRowSelection: true, enableSubRowSelection: false,
        getRowCanExpand: (row) => !!row.original.subRows && row.original.subRows.length > 0,
        columnResizeMode: "onChange", enableColumnResizing: true,
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            };
                        }
                        return row;
                    })
                );
            },
        },
    });

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-sans">
            <div className="mb-4"><Link href="/" className="text-sm text-blue-500 hover:underline mb-2 block">← Back to Variations</Link><h2 className="text-xl font-bold text-gray-800">Variation 3: Master-Detail Panel</h2></div>
            <div className="mb-4 flex items-center justify-between">
                <div className="relative w-64">
                    <input type="text" placeholder="Search all assets" value={uiState.globalFilter} onChange={(e) => uiState.setGlobalFilter(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>
            <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} sensors={sensors}>
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead>{table.getHeaderGroups().map(headerGroup => <tr key={headerGroup.id}><SortableContext items={uiState.columnOrder} strategy={horizontalListSortingStrategy}>{headerGroup.headers.map(header => <DraggableTableHeader key={header.id} header={header} />)}</SortableContext></tr>)}</thead>
                        <tbody>
                            <SortableContext items={table.getRowModel().rows.map(row => row.original.id)} strategy={verticalListSortingStrategy}>
                                {table.getRowModel().rows.map(row => (
                                    <React.Fragment key={row.id}>
                                        <DraggableRow row={row} rowId={row.original.id} dragState={dragState} className={cn("border-b border-gray-100 cursor-pointer transition-colors h-16", row.getIsExpanded() ? "bg-gray-50 border-b-0" : "hover:bg-slate-50", row.getIsSelected() && "bg-opacity-90 ring-1 ring-inset ring-green-400")}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} style={{ width: cell.column.getSize() }} className={cn("text-gray-700", (cell.column.id === "drag-handle") ? "p-0" : "p-0")}>
                                                    <div className={cn("truncate w-full px-4", cell.column.id === "drag-handle" && "flex items-center justify-center p-0")} title={cell.getValue() as string}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </td>
                                            ))}
                                        </DraggableRow>
                                        {row.getIsExpanded() && <tr><td colSpan={columns.length} className="p-0"><SubDetailView subRows={row.original.subRows || []} onAdd={() => handleAddSubItem(row.original.id)} onUpdate={(subId, field, val) => handleUpdateSubItem(row.original.id, subId, field, val)} /></td></tr>}
                                    </React.Fragment>
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </div>
                {typeof window !== "undefined" && createPortal(<DragOverlay adjustScale={true}>{activeId ? (<div className="opacity-90 shadow-2xl cursor-grabbing transform rotate-2 bg-white border border-blue-500 rounded-md overflow-hidden">{activeItem ? (<div className="flex items-center h-14 px-4 bg-gray-50 text-sm font-medium text-gray-700"><div className="flex gap-4"><span className="font-bold">{activeItem.id}</span><span>{activeItem.vehicle}</span><span className="text-gray-400">{activeItem.category}</span></div></div>) : <div className="px-4 py-3 bg-gray-100 font-bold text-gray-700 border-b-2 border-blue-500">{activeId}</div>}</div>) : null}</DragOverlay>, document.body)}
            </DndContext>
        </div>
    );
}
