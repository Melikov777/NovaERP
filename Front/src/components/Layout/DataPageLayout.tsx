import { ReactNode } from 'react';
import { Search, Plus, Filter, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPageLayoutProps {
    title: string;
    children: ReactNode;
    onAdd?: () => void;
    addLabel?: string;
    searchValue: string;
    onSearchChange: (val: string) => void;
    actions?: ReactNode; // Extra actions like Export
}

export const DataPageLayout = ({
    title,
    children,
    onAdd,
    addLabel = "Create",
    searchValue,
    onSearchChange,
    actions
}: DataPageLayoutProps) => {
    return (
        <div className="flex flex-col h-full gap-0 select-none">
            {/* Toolbar Area */}
            <div className="flex justify-between items-center bg-white p-1.5 border border-[var(--c1-border)] border-b-0 rounded-t-[2px]">
                <div className="flex items-center gap-2">
                    <h1 className="text-[14px] font-bold text-gray-800 px-2">{title}</h1>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>

                    {/* Enterprise Search Input */}
                    <div className="relative group">
                        <input
                            placeholder={`Search ${title}...`}
                            className="w-64 pl-2 pr-8 py-1 text-[13px] border border-gray-300 rounded-[2px] focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <Search className="absolute right-2 top-1.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actions}

                    <button className="p-1 px-2 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded-[2px] text-gray-600 flex items-center gap-1 text-[12px]">
                        <Filter className="h-3.5 w-3.5" /> Filter
                    </button>

                    {onAdd && (
                        <button onClick={onAdd} className="btn-1c-primary flex items-center gap-1.5 shadow-none">
                            <Plus className="h-3.5 w-3.5" />
                            <span>{addLabel}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Content Area */}
            <div className="flex-1 overflow-auto bg-white border border-[var(--c1-border)] rounded-b-[2px] relative">
                {children}
            </div>

            {/* Footer Summary (Optional) */}
            <div className="h-6 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 px-2 flex items-center justify-between">
                <span>Rows: ...</span>
                <span>Selection: None</span>
            </div>
        </div>
    );
};
