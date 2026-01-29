import { Asset } from "@/utils/data";

/**
 * Helper to find item and its parent in the tree
 */
export const findItemPath = (items: Asset[], id: string): { parent: Asset | null, index: number, array: Asset[] } | null => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return { parent: null, index: i, array: items };
        }
        if (items[i].subRows) {
            const result = findItemPath(items[i].subRows!, id);
            if (result) {
                if (result.parent === null) {
                    return { parent: items[i], index: result.index, array: items[i].subRows! };
                }
                return result;
            }
        }
    }
    return null;
};
