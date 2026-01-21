import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: string;
}

export const Drawer = ({ isOpen, onClose, title, children, width = "w-96" }: DrawerProps) => {
    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-40",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-300",
                    width,
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <h2 className="font-semibold text-gray-800 text-[14px]">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {children}
                </div>
            </div>
        </>
    );
};
