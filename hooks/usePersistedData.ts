import { useState, useEffect } from "react";
import { Asset } from "@/utils/data";

// --- Persisted Data Hook ---
export function usePersistedData(initialData: Asset[], key: string) {
    const [data, setData] = useState<Asset[]>(() => {
        if (typeof window !== "undefined") {
            const savedData = localStorage.getItem(`assetTableData_${key}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) { console.error(e); }
            }
        }
        return initialData;
    });

    useEffect(() => {
        localStorage.setItem(`assetTableData_${key}`, JSON.stringify(data));
    }, [data, key]);

    return [data, setData] as const;
}
