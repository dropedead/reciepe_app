import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmText = 'Ya, Hapus',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    type = 'danger'
}: ConfirmDialogProps) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-600 dark:text-red-400',
                    iconBg: 'bg-red-100 dark:bg-red-900/30',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    icon: 'text-amber-600 dark:text-amber-400',
                    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white'
                };
            default:
                return {
                    icon: 'text-blue-600 dark:text-blue-400',
                    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                    confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.iconBg}`}>
                            <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="btn btn-ghost btn-icon"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={onCancel}
                            className="btn btn-secondary"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`btn ${colors.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
