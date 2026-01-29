import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { WorkItem } from "@/components/Data/treeData";
import { TreeConnector } from "@/components/Row/TreeConnector";
import { TypeIcon } from "./components/TypeIcon";
import { useDragHandle } from "@/components/Row/DragHandleContext";

// Component to render the drag handle with context listeners
const RowDragHandle = () => {
    const { listeners } = useDragHandle();
    return (
        <GripVertical
            className="text-gray-300 cursor-grab active:cursor-grabbing outline-none"
            size={16}
            {...listeners}
        />
    );
};

const INDENT_STEP = 24;
const BASE_PADDING = 16;

export const getColumns = (
    variant: "complete" | "simple" = "complete",
    indentDataColumns: boolean = false
): ColumnDef<WorkItem>[] => {
    const commonColumns: ColumnDef<WorkItem>[] = [
        {
            id: "drag",
            size: 40,
            header: "",
            cell: () => <RowDragHandle />,
        },
    ];

    const titleColumn: ColumnDef<WorkItem> = {
        accessorKey: "title",
        header: "Title",
        size: 400,
        cell: ({ row, table, getValue }) => {
            const paddingLeft =
                BASE_PADDING + row.depth * INDENT_STEP;

            return (
                <div className="relative h-full w-full flex items-center overflow-visible">
                    {/* SINGLE-SPINE CONNECTOR restored to NESTED */}
                    <TreeConnector row={row} table={table} hasChildren={row.getCanExpand()} />

                    {/* CONTENT */}
                    <div
                        className="flex items-center gap-2 py-2 min-w-0 w-full"
                        style={{ paddingLeft }}
                    >
                        {row.getCanExpand() ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    row.toggleExpanded();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="p-0.5 rounded hover:bg-blue-50 text-blue-500 relative z-10"
                            >
                                {row.getIsExpanded() ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}

                        <TypeIcon type={row.original.type} />

                        <span
                            className="truncate font-medium"
                            title={getValue() as string}
                        >
                            {getValue() as string}
                        </span>
                    </div>
                </div>
            );
        },
    };

    if (variant === "simple") {
        return [...commonColumns, titleColumn];
    }

    // Complete variant includes Order and Type
    return [
        ...commonColumns,
        {
            accessorKey: "order",
            header: "Order",
            size: 80,
            cell: ({ row, getValue }) => (
                <div
                    className="text-gray-500 font-mono text-xs"
                    style={{ paddingLeft: indentDataColumns ? `${row.depth * INDENT_STEP}px` : "0px" }}
                >
                    {getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Work Item Type",
            size: 150,
            cell: ({ row, getValue }) => (
                <div
                    className="font-medium text-gray-600"
                    style={{ paddingLeft: indentDataColumns ? `${row.depth * INDENT_STEP}px` : "0px" }}
                >
                    {getValue() as string}
                </div>
            ),
        },
        titleColumn
    ];
};

export const columns = getColumns("complete"); // Backwards compatibility if needed, though we should switch usages.
