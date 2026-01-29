import { createContext, useContext } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

interface DragHandleContextProps {
    attributes?: any;
    listeners?: DraggableSyntheticListeners;
}

const DragHandleContext = createContext<DragHandleContextProps>({});

export const DragHandleProvider = DragHandleContext.Provider;

export const useDragHandle = () => useContext(DragHandleContext);

export const RowDragHandle = () => {
    const { listeners } = useDragHandle();
    return (
        <div className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
            <GripVertical size={16} {...listeners} />
        </div>
    );
};
