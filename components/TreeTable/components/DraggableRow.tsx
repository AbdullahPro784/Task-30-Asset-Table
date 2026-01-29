
import React from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { WorkItem } from "@/components/Data/treeData";
import { DropType } from "../types";
import { DragHandleProvider } from "@/components/Row/DragHandleContext";

export const DraggableRow = ({
    row,
    dropType,
    isOver,
    onContextMenu,
}: {
    row: Row<WorkItem>;
    dropType: DropType;
    isOver: boolean;
    onContextMenu: (e: React.MouseEvent, rowId: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.original.id,
        data: {
            type: "row",
            item: row.original,
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : 'auto',
    };

    // Visual feedback for drop targets
    let visualStyles = "";
    if (isOver && !isDragging) {
        if (dropType === "reorder-above") {
            visualStyles = "border-t-[3px] border-t-blue-500";
        } else if (dropType === "reorder-below") {
            visualStyles = "border-b-[3px] border-b-blue-500";
        } else if (dropType === "group") {
            visualStyles = "bg-blue-50 ring-2 ring-inset ring-blue-500 z-10 relative";
        }
    }

    return (
        <DragHandleProvider value={{ attributes, listeners }}>
            <tr
                ref={setNodeRef}
                style={style}
                className={cn(
                    "hover:bg-slate-50 border-b border-gray-100 last:border-0 transition-colors bg-white group",
                    visualStyles
                )}
                {...attributes}
                onContextMenu={(e) => onContextMenu(e, row.original.id)}
            >
                {row.getVisibleCells().map(cell => (
                    <td
                        key={cell.id}
                        className={cn(
                            "align-middle text-gray-800 text-sm",
                            cell.column.id === "title" ? "p-0" : "py-2 pr-4"
                        )}
                    >
                        <div {...listeners} className="h-full w-full flex items-center">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                    </td>
                ))}
            </tr>
        </DragHandleProvider>
    );
};
