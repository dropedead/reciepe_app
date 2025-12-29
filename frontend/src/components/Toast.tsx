import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[45] animate-in fade-in slide-in-from-top-8 duration-700 ease-out">
            <div className={`
                overflow-hidden rounded-xl shadow-lg min-w-[400px] max-w-xl
                ${type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                }
            `}>
                <div className="flex items-center gap-3 px-4 py-3">
                    {type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <p className={`text-sm font-medium flex-1 ${
                        type === 'success' 
                            ? 'text-green-800 dark:text-green-100' 
                            : 'text-red-800 dark:text-red-100'
                    }`}>
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className={`
                            p-1 rounded-md transition-colors
                            ${type === 'success'
                                ? 'hover:bg-green-100 dark:hover:bg-green-800 text-green-600 dark:text-green-400'
                                : 'hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400'
                            }
                        `}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className={`h-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                            animation: `shrink ${duration}ms linear forwards`
                        }}
                    />
                </div>
                <style>{`
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}</style>
            </div>
        </div>
    );
};

interface UseToastReturn {
    showToast: (message: string, type: 'success' | 'error') => void;
    ToastContainer: () => JSX.Element | null;
}

export const useToast = (): UseToastReturn => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const ToastContainer = () => {
        if (!toast) return null;

        return (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        );
    };

    return { showToast, ToastContainer };
};

export default Toast;
