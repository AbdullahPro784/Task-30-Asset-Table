
import { WorkItem } from "@/components/Data/treeData";

export type DropType = "reorder-above" | "reorder-below" | "group" | null;

export interface TreeTableProps {
    data?: WorkItem[];
}
