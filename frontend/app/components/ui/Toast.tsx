'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

export interface ToastState {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration: number;
}

const Toast = ({ id, type, title, message, duration = 3000, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Trigger fade in animation
        setIsVisible(true);
        
        // Auto-dismiss timer
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    };

    const getToastStyles = () => {
        const baseStyles = "min-w-80 max-w-sm rounded-lg shadow-lg border-l-4 p-4 mb-3 transition-all duration-300 ease-in-out transform";
        
        if (!isVisible) {
            return `${baseStyles} translate-x-full opacity-0`;
        }
        
        if (isClosing) {
            return `${baseStyles} translate-x-full opacity-0`;
        }

        const typeStyles = {
            success: "bg-white border-green-500 text-gray-800",
            error: "bg-white border-red-500 text-gray-800", 
            warning: "bg-white border-yellow-500 text-gray-800",
            info: "bg-white border-blue-500 text-gray-800"
        };

        return `${baseStyles} translate-x-0 opacity-100 ${typeStyles[type]}`;
    };

    const getIcon = () => {
        const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
        
        switch (type) {
            case 'success':
                return (
                    <svg className={`${iconClass} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className={`${iconClass} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.19 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className={getToastStyles()}>
            <div className="flex items-start">
                {getIcon()}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900">
                        {title}
                    </h4>
                    {message && (
                        <p className="text-sm text-gray-600 mt-1">
                            {message}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleClose}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Fermer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;