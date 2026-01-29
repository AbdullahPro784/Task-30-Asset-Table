"use client";

import React, { useState } from "react";
import TreeTable from "@/components/TreeTable";


export default function TreeTableView() {
    const [view, setView] = useState<"complete" | "simple">("complete");
    const [indentation, setIndentation] = useState(true);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-gray-500">
                    {/* Optional Left Side Label if needed, keeping empty for now or could add 'Tree View Options' */}
                </div>
                <div className="flex items-center space-x-3">
                    {/* Indentation Toggle */}
                    <button
                        onClick={() => setIndentation(!indentation)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors border ${indentation
                            ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        {indentation ? "Indentation On" : "Indentation Off"}
                    </button>

                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setView("complete")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === "complete"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => setView("simple")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === "simple"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Simple
                        </button>
                    </div>
                </div>
            </div>

            <div className="border rounded-md">
                <TreeTable variant={view} indentDataColumns={indentation} />
            </div>
        </div>
    );
}
