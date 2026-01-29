import { TableProperties } from "lucide-react";

export default function LandingHeader() {
    return (
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
                <TableProperties className="text-blue-600 h-8 w-8" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Table Variations</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore different ways to visualize hierarchical data. Select a style below to view the interactive demo.
            </p>
        </div>
    );
}
