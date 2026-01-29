import { useState, useEffect } from "react";
import {
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
    ExpandedState,
} from "@tanstack/react-table";

// --- Persisted UI State Hook ---
export function useTableUIState(key: string, defaultColumnOrder: string[]) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>(true);
    const [columnSizing, setColumnSizing] = useState({});

    // Load initial state
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedOrder = JSON.parse(localStorage.getItem(`assetTableColumnOrder_${key}`) || "[]");
                if (savedOrder.length) {
                    if (!savedOrder.includes("drag-handle")) {
                        savedOrder.unshift("drag-handle");
                    }
                    setColumnOrder(savedOrder);
                }
                const savedSizing = JSON.parse(localStorage.getItem(`assetTableColumnSizing_${key}`) || "{}");
                if (Object.keys(savedSizing).length) setColumnSizing(savedSizing);
            } catch (e) { }
        }
    }, [key]);

    // Persist state
    useEffect(() => { localStorage.setItem(`assetTableColumnOrder_${key}`, JSON.stringify(columnOrder)); }, [columnOrder, key]);
    useEffect(() => { localStorage.setItem(`assetTableColumnSizing_${key}`, JSON.stringify(columnSizing)); }, [columnSizing, key]);

    return {
        sorting, setSorting,
        columnFilters, setColumnFilters,
        globalFilter, setGlobalFilter,
        columnVisibility, setColumnVisibility,
        columnOrder, setColumnOrder,
        rowSelection, setRowSelection,
        expanded, setExpanded,
        columnSizing, setColumnSizing
    };
}
