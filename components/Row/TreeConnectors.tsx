import React from "react";

interface TreeConnectorsProps {
    level: number;
    isExpanded: boolean;
    hasChildren: boolean;
    isLastChild: boolean;
    variant: string;
}

export function TreeConnectors({
    level,
    isExpanded,
    hasChildren,
    isLastChild,
    variant,
}: TreeConnectorsProps) {
    // 1. Strict Variant Control
    if (variant !== "v1" && variant !== "v2") {
        return null;
    }

    // 2. Hide for Root Level (Depth 0)
    if (level === 0) {
        return null;
    }

    // Constants for positioning
    const INDENT_SIZE = 32; // Matches text indent (row.depth * 32)
    const OFFSET_LEFT = 12; // Matches padding-left offset
    const HALF_INDENT = INDENT_SIZE / 2;

    // Arrays to render lines for each level of depth
    const levels = Array.from({ length: level }, (_, i) => i);

    return (
        <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ left: `${OFFSET_LEFT}px` }}>
            {/* Render vertical lines for ancestors */}
            {levels.map((lvl) => (
                <div
                    key={lvl}
                    className="absolute inset-y-0 border-l border-dashed border-gray-300"
                    style={{
                        left: `${lvl * INDENT_SIZE}px`,
                        // Logic for ancestor lines:
                        // They usually go all the way down, but implementation depends on passing ancestor info.
                        // For a simple visual based on current row props, we might need more context (isAncestorLastChild).
                        // If 'level' logic presumes we are at 'level', these are lines FOR THIS level's indentation.
                        // However, standard tree lines usually require knowing if the *parent at that level* is the last child.
                        // Since we don't have that full context array in props yet (requested props: level, isExpanded, hasChildren, isLastChild, variant),
                        // we will draw a line for the CURRENT level minus 1 (the parent connection).
                        // Wait, the user requirement says: "vertical dotted lines continue down to the last sibling but stop exactly at the last child".
                        // Without ancestor chain 'isLastChild' data, we can't correctly stop ancestor lines.
                        // V1/V2 design usually implies just the 'L' connector for the immediate node.
                        // Let's focus on the Immediate 'L' Connector first as that's the primary visual for "TreeConnectors".
                    }}
                />
            ))}

            {/* 
               Actually, looking at the previous implementation and requirements:
               "Ensure vertical dotted lines continue down to the last sibling but stop exactly at the last child of a branch."
               This implies we DO need to render vertical lines for the current depth.
               
               However, without ancestor "isLast" state, we can only control the *current* node's line.
               Let's assume the previous `TreeConnector` logic where it walked up ancestors was valuable, 
               but the user specifically asked for these props: `level`, `isExpanded`, `hasChildren`, `isLastChild`, `variant`.
               
               If we are restricted to ONLY these props, we can only draw the connector for the CURRENT node (level).
               
               Let's implement the connector for the current node at `level`.
            */}

            <div
                className="absolute"
                style={{
                    left: `${(level - 1) * INDENT_SIZE}px`, // Position at parent's level
                    top: 0,
                    bottom: 0,
                    width: `${INDENT_SIZE}px`,
                }}
            >
                {/* 
                    L-Shape Logic:
                    1. Vertical line from top to center (always needed to connect to prev sibling/parent)
                    2. Horizontal line from center to right (to connect to content)
                    3. Vertical line from center to bottom (ONLY if NOT last child, to connect to next sibling)
                */}

                {/* 1. Top to Center Vertical */}
                <div className="absolute left-0 top-0 h-1/2 w-px border-l border-dashed border-gray-400" />

                {/* 2. Center to Right Horizontal */}
                <div className="absolute top-1/2 left-0 h-px border-t border-dashed border-gray-400" style={{ width: '16px' }} />

                {/* 3. Center to Bottom Vertical (If not last child) */}
                {!isLastChild && (
                    <div className="absolute left-0 top-1/2 bottom-0 w-px border-l border-dashed border-gray-400" />
                )}

                {/* Leaf Node Dot */}
                {!hasChildren && (
                    <div className="absolute rounded-full bg-blue-500"
                        style={{
                            width: '5px',
                            height: '5px',
                            top: '50%',
                            left: '16px', // At the end of the 16px connector
                            transform: 'translate(-50%, -50%)', // Center on the line end
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Re-reading requirements carefully:
// "Use the level prop to determine the indentation depth."
// "Ensure vertical dotted lines continue down to the last sibling but stop exactly at the last child of a branch."
// "Props to include: level: number, isExpanded: boolean, hasChildren: boolean, isLastChild: boolean, and variant: string."
// PROBLEM: With ONLY these props, we cannot draw the vertical lines for *ancestors* (checking if they are last children or not).
// Ancestor lines (ghost rails) require knowing the state of ancestors.
// If the user strictly wants THESE props, maybe they only want the "current level" connector?
// OR they might rely on an external loop calling this? No, "replace inline logic... with this new component".
// Use Context or passing `row` is easier, but user specified props.
// I will implement the L-shape for the CURRENT row using `level`.
// If ancestor lines are needed, `level` implies we might just render ONE L-shape at the correct indentation.
// But standard tree view usually has lines on the left for parents found further up.
// I will assume for now we render the connector for THIS node.
// To fully support "vertical dotted lines continue down...", we normally need an array of `isLastChild` for all depths.
// I'll stick to the requested props. If visual is missing ancestor lines, I can add `ancestorLines` prop later.
// Actually, I can use a trick: standard pass-through lines are hard without extra data.
// But for V1/V2 (Table variants), maybe we just want the L-shape for the item itself?
// Let's build what is requested: Input Props -> L Shape at Indent.

// Refined Component:
