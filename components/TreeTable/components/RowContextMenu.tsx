import React, { useEffect, useRef, useState } from "react";
import { FolderPlus, Check, Folder, ListTree, Layers } from "lucide-react";

export type CreateType = "Group" | "Folder" | "Hierarchy";

interface RowContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onCreateItem: (name: string, type: CreateType) => void;
}

export const RowContextMenu = ({ x, y, onClose, onCreateItem }: RowContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [createMode, setCreateMode] = useState<CreateType | null>(null);
    const [itemName, setItemName] = useState("");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [onClose]);

    useEffect(() => {
        if (createMode && inputRef.current) {
            inputRef.current.focus();
            setItemName(`New ${createMode}`);
        }
    }, [createMode]);

    const handleSubmit = () => {
        if (itemName.trim() && createMode) {
            onCreateItem(itemName.trim(), createMode);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            setCreateMode(null);
            onClose();
        }
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-64 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            {!createMode ? (
                <>
                    <button
                        onClick={() => setCreateMode("Group")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                        <Layers size={16} />
                        New Group
                    </button>
                    <button
                        onClick={() => setCreateMode("Folder")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                        <Folder size={16} />
                        New Folder
                    </button>
                    <button
                        onClick={() => setCreateMode("Hierarchy")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                        <ListTree size={16} />
                        New Hierarchy
                    </button>
                </>
            ) : (
                <div className="px-3 py-2 flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        placeholder={`${createMode} Name`}
                    />
                    <button
                        onClick={handleSubmit}
                        className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        <Check size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};
