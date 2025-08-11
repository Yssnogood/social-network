'use client';

import Toast, { ToastState } from './Toast';

interface ToastContainerProps {
    toasts: ToastState[];
    onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={onRemove}
                />
            ))}
        </div>
    );
};

export default ToastContainer;