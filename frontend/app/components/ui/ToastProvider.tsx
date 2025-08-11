'use client';

import { useToast } from '../../hooks/useToast';
import ToastContainer from './ToastContainer';
import { createContext, useContext, ReactNode } from 'react';
import { ToastType } from './Toast';

interface ToastContextType {
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
    addToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
    clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
    const { toasts, removeToast, success, error, warning, info, addToast, clearAll } = useToast();

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast, clearAll }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;