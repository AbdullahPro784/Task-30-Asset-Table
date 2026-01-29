import { LayoutList, ListTree, TableProperties, FileText } from "lucide-react";

export const navigationCards = [
    {
        href: "/?v=original",
        title: "Original",
        description: "The original flat table implementation without tree capabilities.",
        icon: FileText,
        color: "gray" as const,
    },
    {
        href: "/?v=v1",
        title: "Variation 1",
        description: "Indented sub-rows. Classic tree view style.",
        icon: ListTree,
        color: "orange" as const,
    },
    {
        href: "/?v=v2",
        title: "Variation 2",
        description: "Structured grid with guide lines and nested backgrounds.",
        icon: LayoutList,
        color: "blue" as const,
    },
    {
        href: "/?v=v3",
        title: "Variation 3",
        description: "Master-Detail view with full-width sub-panels.",
        icon: TableProperties,
        color: "green" as const,
    },
    {
        href: "/?v=tree",
        title: "Tree View (New)",
        description: "Hierarchical tree view with Epic > Feature > Task structure.",
        icon: ListTree,
        color: "purple" as const,
    },
];
