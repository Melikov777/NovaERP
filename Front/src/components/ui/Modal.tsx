import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <Fragment>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={cn(
                        "w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg shadow-xl pointer-events-auto transition-all transform",
                        className
                    )}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            </div>
        </Fragment>,
        document.body
    );
};
