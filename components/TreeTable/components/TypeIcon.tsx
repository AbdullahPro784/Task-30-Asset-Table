
import React from "react";
import {
    Crown,
    Trophy,
    FileText,
    CheckSquare,
    ClipboardList,
    FolderOpen,
    ListTree,
} from "lucide-react";

export const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "Epic": return <Crown className="text-orange-500 fill-orange-100" size={16} />;
        case "Feature": return <Trophy className="text-purple-600 fill-purple-100" size={16} />;
        case "Product Backlog Item": return <ClipboardList className="text-blue-500 fill-blue-100" size={16} />;
        case "Task": return <CheckSquare className="text-yellow-600 fill-yellow-100" size={16} />;
        case "Group": return <FolderOpen className="text-gray-500 fill-gray-100" size={16} />;
        case "Folder": return <FolderOpen className="text-indigo-500 fill-indigo-100" size={16} />;
        case "Hierarchy": return <ListTree className="text-teal-600 fill-teal-100" size={16} />;
        default: return <FileText size={16} />;
    }
};
