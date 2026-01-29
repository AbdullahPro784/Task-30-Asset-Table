
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Asset } from "@/utils/data";
import { EditableCell } from "./Cell/CellEditor";
import { StatusEditableCell } from "./Cell/StatusEditableCell";
import { RowDragHandle } from "@/components/Row/DragHandleContext";

export const getColumns = (uniqueCategories: string[]): ColumnDef<Asset>[] => [
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
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
                {row.getCanExpand() && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            row.toggleExpanded();
                        }}
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                        )}
                    </button>
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
    },
    {
        accessorKey: "id",
        header: "CUSTOMER NAME",
        cell: (info) => <div className="px-4 py-3 h-full font-medium">{info.getValue() as string}</div>,
        size: 150,
    },
    {
        accessorKey: "serial",
        header: "SERIAL",
        cell: EditableCell,
        size: 150,
    },
    {
        accessorKey: "category",
        header: "CATEGORY",
        cell: (props) => <EditableCell {...props} options={uniqueCategories} />,
        size: 140,
    },
    {
        accessorKey: "brand",
        header: "BRAND",
        cell: EditableCell,
        size: 140,
    },
    {
        accessorKey: "type",
        header: "TYPE",
        cell: EditableCell,
        size: 140,
    },
    {
        accessorKey: "vehicle",
        header: "VEHICLE",
        size: 140,
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

            // Helper to update the cell
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
    {
        accessorKey: "endDate",
        header: "ESTIMATED DATE",
        cell: (props) => <EditableCell {...props} type="date" />,
        size: 140,
    },
    {
        accessorKey: "status",
        header: "STATUS",
        size: 180,
        cell: StatusEditableCell,
    },
];
