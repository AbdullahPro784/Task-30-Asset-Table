
export interface ColumnConfig {
    accessorKey: string;
    header: string;
    size: number;
    type?: 'text' | 'select' | 'date'; // simple type mapping
}

export const COMMON_COLUMNS_CONFIG: ColumnConfig[] = [
    { accessorKey: "serial", header: "Serial", size: 150, type: "text" },
    { accessorKey: "category", header: "Category", size: 140, type: "select" },
    { accessorKey: "brand", header: "Brand", size: 140, type: "text" },
    { accessorKey: "type", header: "Type", size: 140, type: "text" },
    { accessorKey: "vehicle", header: "Vehicle", size: 140 }, // Vehicle is custom, but we can list it here if we want to map order, but rendering is custom. 
    // Actually vehicle has custom rendering in all files. So we might need to handle it separately or add a custom render key.
    // Let's stick to the ones that use EditableCell exclusively for now to be safe, or mark it as type: 'custom'.
    // The user said "use arraymap instead of hardcoding everything".
    { accessorKey: "endDate", header: "End Date", size: 140, type: "date" },
    // Status is also custom.
];
