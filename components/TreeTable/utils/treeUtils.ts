
import { WorkItem } from "@/components/Data/treeData";

// Recursively find an item and its parent
export const findItemPath = (items: WorkItem[], id: string): { parent: WorkItem | null, index: number, array: WorkItem[] } | null => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return { parent: null, index: i, array: items };
        }
        if (items[i].children) {
            const result = findItemPath(items[i].children!, id);
            if (result) {
                if (result.parent === null) {
                    return { parent: items[i], index: result.index, array: items[i].children! };
                }
                return result;
            }
        }
    }
    return null;
};

// Recursively remove item
export const removeItem = (items: WorkItem[], id: string): WorkItem[] => {
    return items.filter(item => {
        if (item.id === id) return false;
        if (item.children) {
            item.children = removeItem(item.children, id);
        }
        return true;
    });
};

// Recalculate orders recursively
export const recalculateOrders = (items: WorkItem[], parentOrder: string = "") => {
    items.forEach((item, index) => {
        const currentOrder = parentOrder ? `${parentOrder}.${index + 1}` : `${index + 1}`;
        item.order = currentOrder;
        if (item.children && item.children.length > 0) {
            recalculateOrders(item.children, currentOrder);
        }
    });
    return items;
};
