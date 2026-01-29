import React, {  useEffect, useState } from "react";
import { 
    CheckCircle, 
    AlertCircle, 
    HelpCircle, 
    Wrench, 
    HardHat, 
    Settings 
} from "lucide-react"; 
import { AssetStatus } from "../../utils/data";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusOptions = [
    { value: 'operational', label: 'Operational', icon: CheckCircle, color: 'text-green-500' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-orange-500' },
    { value: 'repair', label: 'Repair', icon: Settings, color: 'text-red-500' },
    { value: 'inspection', label: 'Inspection', icon: HardHat, color: 'text-yellow-500' },
];

export const StatusEditableCell = ({
    getValue,
    row,
    column,
    table,
}: {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
}) => {
    const initialValue = getValue() as AssetStatus;
    // We can rely on props updating, but local state isn't strictly harmful if synced. 
    // However, for the dropdown fix we primarily need the updateData call.
    
    // Simplification: The previous code handled "level" parsing e.g. "maintenance:1".
    // The user's request suggests a simpler mapping for now, OR valid levels.
    // Let's deduce the current status object to find the matching option.
    // If the value is complex, we might need to preserve that complexity. 
    // Looking at the previous code, it had levels. 
    // The user's request example "statusOptions" has simple values 'operational', 'level-1' etc.
    // BUT the previous code had logic to parse "state:level".
    // I should probably map the existing complex state to these display options if possible, 
    // OR just implement the user's requested structure if they are redefining it.
    // User request:
    // statusOptions = [ { value: 'operational', ... }, { value: 'level-1', ... } ]
    // The previous code had:  { label: "Level 1 (Spanner)", value: "maintenance:1" }
    // I will try to respect the previous data structure while using the new UI.

    // Let's reconstruct the options to match the previous capabilities but with the new UI.
    const extendedStatusOptions = [
         { value: 'operational:0', label: 'Operational', icon: CheckCircle, color: 'text-green-500' },
         { value: 'maintenance:1', label: 'Level 1 (Spanner)', icon: Wrench, color: 'text-orange-500' },
         { value: 'maintenance:2', label: 'Level 2 (Hat)', icon: HardHat, color: 'text-yellow-500' },
         // detailed logic from previous file:
         { value: 'repair:3', label: 'Level 3 (Settings)', icon: Settings, color: 'text-red-500' },
         { value: 'operational:4', label: 'Level 4 (Check)', icon: CheckCircle, color: 'text-blue-500' },
    ];

    const currentCompositeValue = `${initialValue.state}:${initialValue.level || 0}`;
    const currentStatus = extendedStatusOptions.find(s => s.value === currentCompositeValue) || extendedStatusOptions[0];
    const Icon = currentStatus.icon;

    return (
        <div 
            className="w-full h-full flex items-center px-2"
            // CRITICAL: Stop drag events from stealing the click
            onPointerDown={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 w-full transition-colors">
                        <Icon className={cn("h-4 w-4", currentStatus.color)} />
                        <span className="text-sm text-gray-700 truncate">{currentStatus.label}</span> 
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {extendedStatusOptions.map((option) => (
                        <DropdownMenuItem 
                            key={option.value}
                            onClick={() => {
                                const [stateStr, levelStr] = option.value.split(":");
                                const newLevel = parseInt(levelStr, 10);
                                const newStatus: AssetStatus = {
                                    state: stateStr as any,
                                    level: newLevel > 0 ? newLevel : undefined,
                                };
                                table.options.meta?.updateData(row.index, column.id, newStatus);
                            }}
                        >
                            <option.icon className={cn("h-4 w-4 mr-2", option.color)} />
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
