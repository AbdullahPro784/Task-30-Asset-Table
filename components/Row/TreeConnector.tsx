import React from "react";
import { Row, Table } from "@tanstack/react-table";

interface TreeConnectorProps<TData> {
    row: Row<TData>;
    table: Table<TData>;
}

export function TreeConnector<TData>({ row, table, hasChildren = false }: TreeConnectorProps<TData> & { hasChildren?: boolean }) {
    const INDENT_STEP = 24;
    const BASE_PADDING = 16;

    // Depth 0 items don't need connector lines pointing to them from a parent,
    // but they might need vertical lines passing through them if we were drawing root lines.
    // Usually root items just sit there. `row.depth` is 0 based.
    if (row.depth === 0) return null;

    const ancestors: Row<TData>[] = [];

    // Explicitly reconstruct ancestor chain using parentId and table lookup
    let current = row;
    while (current.parentId) {
        // @ts-ignore - rowsById is internal or requires specific model, but standard in v8
        const parent = table.getRowModel().rowsById[current.parentId];
        if (parent) {
            ancestors.unshift(parent);
            current = parent;
        } else {
            break;
        }
    }

    // Helper to check if a row is the last child of its parent
    const isLastChild = (node: Row<TData>) => {
        // @ts-ignore
        const parent = node.parentId ? table.getRowModel().rowsById[node.parentId] : null;
        const siblings = parent ? parent.subRows : table.getRowModel().rows;
        return node.index === siblings.length - 1;
    };

    const isCurrentLast = isLastChild(row);

    return (
        <div
            className="absolute inset-0 pointer-events-none flex"
            style={{ left: BASE_PADDING }}
        >
            {/* 1. Ancestor Lines (Vertical Pass-throughs) */}
            {ancestors.map((ancestor, i) => {
                const islast = isLastChild(ancestor);
                return (
                    <div
                        key={ancestor.id}
                        style={{ width: INDENT_STEP, height: '100%', position: 'relative' }}
                    >
                        {!islast && (
                            <div className="absolute left-1/2 top-0 bottom-0 w-px -ml-px border-l border-dashed border-gray-300" />
                        )}
                    </div>
                );
            })}

            {/* 2. Current Row Connector (L or T shape) */}
            <div style={{ width: INDENT_STEP, height: '100%', position: 'relative' }}>
                {/* Top Half Vertical (Connects to parent) */}
                <div className="absolute left-1/2 top-0 h-1/2 w-px -ml-px border-l border-dashed border-gray-300" />

                {/* Horizontal Line (Connects to node) */}
                <div className="absolute left-1/2 top-1/2 right-0 h-px border-t border-dashed border-gray-300" />

                {/* Bottom Half Vertical (Connects to siblings? Only if NOT last child) */}
                {!isCurrentLast && (
                    <div className="absolute left-1/2 top-1/2 bottom-0 w-px -ml-px border-l border-dashed border-gray-300" />
                )}

                {/* Optional: Dot at the junction like the image example - ONLY IF NO CHILDREN */}
                {!hasChildren && (
                    <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-blue-400" />
                )}
            </div>
        </div>
    );
}
