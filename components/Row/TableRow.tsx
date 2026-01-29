import React, { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DragHandleProvider } from "./DragHandleContext";

// Interface allows for children and handles the 'dragState' prop clean-up
interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    rowId: string;
    row: any;
    dragState?: any; // We accept this prop to prevent it from leaking to the DOM
}

export const DraggableRow = forwardRef<HTMLTableRowElement, DraggableRowProps>(({
    rowId,
    row,
    className,
    children,
    dragState, // Destructure to remove from ...props
    ...props
}, ref) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: rowId });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: "relative" as "relative",
    };

    return (
        // 1. Establish the Drag Context for the handle icon
        <DragHandleProvider value={{ attributes, listeners }}>
            <tr
                ref={(node) => {
                    setNodeRef(node);
                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
                    }
                }}
                style={style}
                // 2. Apply Accessibility Attributes to the Row
                {...attributes}
                // 3. CLEAN PROPS: Do not pass 'listeners' to TR (prevents click-to-drag)
                className={cn(className, isDragging && "bg-blue-50 z-50 relative")}
                {...props}
            >
                {/* 4. RENDER CHILDREN: This allows AssetTable to inject the columns/cells */}
                {children}
            </tr>
        </DragHandleProvider>
    );
});

DraggableRow.displayName = "DraggableRow";
