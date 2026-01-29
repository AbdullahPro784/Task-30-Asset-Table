import { db } from "@/lib/db";
import { Asset } from "@/utils/data";

export async function getAssets(): Promise<Asset[]> {
    const items: any[] = await db.item.findMany({
        orderBy: { createdAt: "desc" },
    });

    const mappedItems: Asset[] = items.map((item) => ({
        id: item.id,
        serial: item.serial,
        category: item.category,
        brand: item.brand,
        type: item.type,
        vehicle: item.vehicle,
        status: {
            state: item.statusState as any,
            level: item.statusLevel ?? undefined,
        },
        endDate: item.endDate ?? undefined,
    }));

    // Mock sub-rows for demonstration (Tree Grid)
    if (mappedItems.length > 0) {
        mappedItems[0].subRows = [
            {
                id: "sub-1",
                serial: "SALE-2024-001",
                category: "Sales Record",
                brand: "-",
                type: "Invoice",
                vehicle: "-",
                status: { state: "operational", level: 4 },
                endDate: "2024-12-01"
            },
            {
                id: "sub-2",
                serial: "SALE-2024-002",
                category: "Sales Record",
                brand: "-",
                type: "Receipt",
                vehicle: "-",
                status: { state: "operational", level: 4 },
                endDate: "2024-12-05",
                subRows: [
                    {
                        id: "sub-2-1",
                        serial: "DTL-X",
                        category: "Line Item",
                        brand: "-",
                        type: "Detail",
                        vehicle: "-",
                        status: { state: "inspection", level: 4 }, // Fixed typo from 'ispection'
                        endDate: "2024-12-05"
                    }
                ]
            }
        ];
    }

    return mappedItems;
}
