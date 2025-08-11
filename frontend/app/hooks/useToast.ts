'use client';

import { useState, useCallback } from 'react';
import { ToastType, ToastState } from '../components/ui/Toast';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const addToast = useCallback((
        type: ToastType, 
        title: string, 
        message?: string, 
        duration: number = 3000
    ) => {
        const id = (++toastId).toString();
        const newToast: ToastState = {
            id,
            type,
            title,
            message,
            duration
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('success', title, message, duration);
    }, [addToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('error', title, message, duration);
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('warning', title, message, duration);
    }, [addToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('info', title, message, duration);
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        clearAll
    };
};