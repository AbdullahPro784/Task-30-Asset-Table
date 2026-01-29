import React, { useState, useRef, useEffect } from "react";
import { Asset } from "@/utils/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LayoutList, MessageSquare } from "lucide-react";

// --- Sub-Item Editable Cell ---
export const SubItemEditableCell = ({
    value: initialValue,
    onSave
}: {
    value: string,
    onSave: (val: string) => void
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (value !== initialValue) {
            onSave(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border border-blue-400 rounded bg-white text-xs font-medium text-gray-800 focus:outline-none"
            />
        );
    }

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className="w-full h-full px-3 py-2 cursor-text hover:bg-gray-100 rounded transition-colors"
        >
            {value}
        </div>
    );
};


// --- Sub-Component for Detail View ---
export function SubDetailView({
    subRows,
    onAdd,
    onUpdate
}: {
    subRows: Asset[],
    onAdd: () => void,
    onUpdate: (id: string, field: keyof Asset, value: string) => void
}) {
    // Determine content based on whether subRows exist
    const hasRows = subRows && subRows.length > 0;

    return (
        <div className="bg-gray-50 p-4 border-t border-b border-gray-200 shadow-inner relative">
            {/* Visual single parent line extension - Matches TreeLines baseOffset (20px) */}
            <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-gray-200" />

            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 relative z-10 pl-[50px]">
                <LayoutList size={16} /> Sub-Items / Tasks
            </h4>
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden relative z-10 ml-[50px]">
                {hasRows ? (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 font-medium"></th>
                                <th className="px-3 py-2 font-medium">Subitem (Serial)</th>
                                <th className="px-3 py-2 font-medium">Category</th>
                                <th className="px-3 py-2 font-medium">Owner</th>
                                <th className="px-3 py-2 font-medium">Status</th>
                                <th className="px-3 py-2 font-medium">Date</th>
                                <th className="px-3 py-2 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subRows.map((sub, idx) => (
                                <tr key={sub.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50">
                                    <td className="px-3 py-2 w-8 text-center text-gray-400">{idx + 1}</td>

                                    {/* Editable Serial */}
                                    <td className="p-0 font-medium text-gray-800 w-32 border-r border-transparent hover:border-gray-200">
                                        <SubItemEditableCell
                                            value={sub.serial}
                                            onSave={(val) => onUpdate(sub.id, 'serial', val)}
                                        />
                                    </td>

                                    {/* Editable Category */}
                                    <td className="p-0 font-medium text-gray-800 w-32 border-r border-transparent hover:border-gray-200">
                                        <SubItemEditableCell
                                            value={sub.category}
                                            onSave={(val) => onUpdate(sub.id, 'category', val)}
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="flex -space-x-2">
                                            <Avatar className="h-6 w-6 border-2 border-white">
                                                <AvatarFallback className="bg-orange-200 text-orange-800 text-[10px]">JD</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide",
                                            sub.status.state === 'operational' ? "bg-green-100 text-green-700" :
                                                sub.status.state === 'maintenance' ? "bg-orange-100 text-orange-700" :
                                                    "bg-gray-100 text-gray-700"
                                        )}>
                                            {sub.status.state}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{sub.endDate || "-"}</td>
                                    <td className="px-3 py-2">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <MessageSquare size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-xs italic">
                        No sub-items found. Click below to add one.
                    </div>
                )}

                <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onAdd}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        + Add subitem
                    </button>
                </div>
            </div>
        </div>
    )
}
