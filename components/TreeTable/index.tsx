
"use client";

import React, { useState, useEffect } from "react";
import {
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    ExpandedState,
    flexRender,
} from "@tanstack/react-table";
import {
    GripVertical,
} from "lucide-react";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    MeasuringStrategy,
    DropAnimation,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { TREE_DATA, WorkItem } from "@/components/Data/treeData";
import { findItemPath, removeItem, recalculateOrders } from "./utils/treeUtils";
import { DropType } from "./types";
import { DraggableRow } from "./components/DraggableRow";
import { TypeIcon } from "./components/TypeIcon";
import { RowContextMenu, CreateType } from "./components/RowContextMenu";
import { getColumns } from "./columns";

interface TreeTableProps {
    variant?: "complete" | "simple";
    indentDataColumns?: boolean;
}

export default function TreeTable({ variant = "complete", indentDataColumns = false }: TreeTableProps) {
    const [data, setData] = useState<WorkItem[]>(TREE_DATA);
    const [expanded, setExpanded] = useState<ExpandedState>(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Track drop state
    const [overId, setOverId] = useState<string | null>(null);
    const [dropType, setDropType] = useState<DropType>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, rowId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    };

    const handleCreateItem = (rowId: string, name: string, type: CreateType) => {
        // 1. Update Data
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const path = findItemPath(newData, rowId);
            if (!path) return prev;

            const parentItem = path.array[path.index];

            if (!parentItem.children) parentItem.children = [];

            const newItem: WorkItem = {
                id: `${type.toLowerCase()}-${Date.now()}`,
                type: type as any,
                title: name,
                order: `${parentItem.order}.${parentItem.children.length + 1}`,
                children: []
            };

            parentItem.children.push(newItem);
            recalculateOrders(newData); // Ensure order numbers are correct

            return newData;
        });

        // 2. Ensure Parent is Expanded
        setExpanded(prev => {
            if (prev === true) return true; // Keep "Expand All" state
            return {
                ...prev,
                [rowId]: true
            };
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const table = useReactTable({
        data,
        columns: getColumns(variant, indentDataColumns),
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const path = findItemPath(data, event.active.id as string);
        if (path) setActiveItem(path.array[path.index]);
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        setOverId(over?.id as string || null);

        if (!over || active.id === over.id) {
            setDropType(null);
            return;
        }

        if (active.rect.current.translated && over.rect) {
            const activeTop = active.rect.current.translated.top;
            const activeHeight = active.rect.current.translated.height;
            const activeCenter = activeTop + activeHeight / 2;

            const overTop = over.rect.top;
            const overHeight = over.rect.height;

            const relY = activeCenter - overTop;
            const percentage = relY / overHeight;

            // Strict Logic:
            // Top 40% -> Reorder Above
            // Bottom 40% -> Reorder Below
            // Middle 20% -> Group/Nest
            if (percentage < 0.40) setDropType("reorder-above");
            else if (percentage > 0.60) setDropType("reorder-below");
            else setDropType("group");
        } else {
            setDropType(null);
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // Reset DnD state
        setActiveId(null);
        setActiveItem(null);
        setOverId(null);
        setDropType(null);

        if (!over) return;
        if (active.id === over.id) return;

        let action: DropType = null;

        if (active.rect.current.translated && over.rect) {
            const activeTop = active.rect.current.translated.top;
            const activeHeight = active.rect.current.translated.height;
            const activeCenter = activeTop + activeHeight / 2;
            const overTop = over.rect.top;
            const overHeight = over.rect.height;
            const relY = activeCenter - overTop;
            const percentage = relY / overHeight;

            if (percentage < 0.40) action = "reorder-above";
            else if (percentage > 0.60) action = "reorder-below";
            else action = "group";
        }

        if (!action) return;

        // Perform Data Updates
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const activePath = findItemPath(newData, active.id as string);
            if (!activePath) return prev;

            const activeItem = activePath.array[activePath.index];

            // Circular Check? (Prevent dropping parent into child)
            // findItemPath doesn't give full chain easily here, but we should adding check:
            // For now assuming a basic structure. 

            // 1. Remove from old location
            const newDataWithRemoved = removeItem(newData, active.id as string);

            // 2. Handle Grouping/Nesting (Middle 20%)
            if (action === "group") {
                const overPath = findItemPath(newDataWithRemoved, over.id as string);
                if (!overPath) return prev; // Target lost?

                const overItem = overPath.array[overPath.index];

                // Initialize children array if missing
                if (!overItem.children) overItem.children = [];

                // Add to children
                overItem.children.push(activeItem);

                recalculateOrders(newDataWithRemoved);
                return newDataWithRemoved;
            }

            // 3. Handle Reodering (Top/Bottom)
            const newOverPath = findItemPath(newDataWithRemoved, over.id as string);
            if (!newOverPath) return newData;

            let insertIndex = newOverPath.index;
            if (action === "reorder-below") insertIndex += 1;

            newOverPath.array.splice(insertIndex, 0, activeItem);

            recalculateOrders(newDataWithRemoved);
            return newDataWithRemoved;
        });
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    if (!isMounted) {
        return <div className="p-4 text-gray-500">Loading tree view...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                }
            }}
        >
            <div className="w-full p-4 font-sans">
                <div className="rounded-md border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-3 font-medium text-xs uppercase tracking-wider">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <SortableContext
                                items={table.getRowModel().rows.map(r => r.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows.map(row => (
                                    <DraggableRow
                                        key={row.original.id}
                                        row={row}
                                        isOver={row.original.id === overId}
                                        dropType={row.original.id === overId ? dropType : null}
                                        onContextMenu={handleContextMenu}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </div>

                {/* Context Menu */}
                {contextMenu && (
                    <RowContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={() => setContextMenu(null)}
                        onCreateItem={(name, type) => handleCreateItem(contextMenu.rowId, name, type)}
                    />
                )}

                {/* Drag Overlay */}
                {typeof window !== "undefined" && createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId && activeItem ? (
                            <div className="opacity-90 shadow-xl bg-white border border-blue-500 rounded p-3 flex items-center gap-2 w-96">
                                <GripVertical className="text-gray-400" size={16} />
                                <TypeIcon type={activeItem.type} />
                                <span className="font-semibold">{activeItem.title}</span>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </div>
        </DndContext>
    );
}
