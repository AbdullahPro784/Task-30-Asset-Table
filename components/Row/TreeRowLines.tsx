import React from "react";
import { Row, Table } from "@tanstack/react-table";
import { TreeConnector } from "./TreeConnector";

interface TreeRowLinesProps<TData> {
    row: Row<TData>;
    table: Table<TData>;
}

export const TreeRowLines = <TData,>({ row, table }: TreeRowLinesProps<TData>) => {
    return <TreeConnector row={row} table={table} />;
};
