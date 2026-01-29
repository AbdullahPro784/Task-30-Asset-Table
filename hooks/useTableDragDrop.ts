import { useState } from "react";
import { ColumnOrderState } from "@tanstack/react-table";
import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Asset } from "@/utils/data";
import { findItemPath } from "@/utils/treeUtils";

// --- Drag & Drop Logic Hook ---
export function useTableDragDrop(
    data: Asset[],
    setData: React.Dispatch<React.SetStateAction<Asset[]>>,
    setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>,
    variant: 'flat' | 'nested' = 'flat'
) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<Asset | null>(null);
    const [dragState, setDragState] = useState<{ overId: string; position: 'top' | 'bottom' | 'inside' } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        setDragState(null);
        if (event.active.data.current?.type === 'row') {
            const path = findItemPath(data, event.active.id as string);
            if (path) setActiveItem(path.array[path.index]);
        }
    }

    // Helper calculate position
    const getDropPosition = (event: any): 'top' | 'bottom' | 'inside' | null => {
        if (!event.over) return null;

        // We can access the collision rect directly from the custom data or the event
        // dnd-kit provides `event.collisions` sometimes, or we can use the `over` rect.
        // `event.over.rect` is often not directly typed in basic DragEndEvent, but available at runtime.
        const overRect = event.over.rect;

        // Use the activator event payload for mouse coordinates if available
        const clientY = event.activatorEvent.clientY;

        // Fallback for rect
        if (!overRect) return null;

        const relativeY = clientY - overRect.top;
        const height = overRect.height;

        // Logic:
        // Top 40% -> Top (Reorder above)
        // Bottom 40% -> Bottom (Reorder below)
        // Middle 20% -> Inside (Nest)

        if (relativeY < height * 0.40) return 'top';
        if (relativeY > height * 0.60) return 'bottom';
        return 'inside';
    };

    function handleDragOver(event: any) {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            setDragState(null);
            return;
        }

        const position = getDropPosition(event);
        if (position) {
            setDragState({ overId: over.id as string, position });
        } else {
            setDragState(null);
        }
    }

    // Helper to check circular dependency
    const checkIsChild = (parent: Asset, childId: string): boolean => {
        if (!parent.subRows) return false;
        return parent.subRows.some(child => child.id === childId || checkIsChild(child, childId));
    };

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);
        setDragState(null);

        if (!over) return;
        if (active.id === over.id) return;

        // 1. Handle Column Reordering
        if (active.data.current?.type === "column") {
            setColumnOrder((order) => {
                const oldIndex = order.indexOf(active.id as string);
                const newIndex = order.indexOf(over.id as string);
                return arrayMove(order, oldIndex, newIndex);
            });
            return;
        }

        // 2. Handle Row Reordering
        setData((prevData) => {
            // --- A. FLAT LIST LOGIC (Original Table) ---
            // This effectively fixes the "Snap Back" issue by using standard arrayMove
            if (variant === 'flat') {
                const oldIndex = prevData.findIndex((item) => item.id === active.id);
                const newIndex = prevData.findIndex((item) => item.id === over.id);
                return arrayMove(prevData, oldIndex, newIndex);
            }

            // --- B. TREE LOGIC (Variations 1, 2, 3) ---
            const newData = JSON.parse(JSON.stringify(prevData));

            const findItem = (items: any[], id: string): { item: any, index: number, parent: any[] } | null => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) return { item: items[i], index: i, parent: items };
                    if (items[i].subRows) {
                        const found = findItem(items[i].subRows, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const activeFound = findItem(newData, active.id as string);
            const overFound = findItem(newData, over.id as string);

            if (!activeFound || !overFound) return prevData;

            // Reorder within same parent
            if (activeFound.parent === overFound.parent) {
                // Use indices found BEFORE mutation to avoid off-by-one errors
                const oldIndex = activeFound.index;
                const newIndex = overFound.index;

                // 1. Remove
                const [movedItem] = activeFound.parent.splice(oldIndex, 1);
                // 2. Insert
                activeFound.parent.splice(newIndex, 0, movedItem);

                return newData;
            }

            return prevData;
        });
    }

    return { sensors, activeId, activeItem, handleDragStart, handleDragEnd, handleDragOver, dragState };
}
