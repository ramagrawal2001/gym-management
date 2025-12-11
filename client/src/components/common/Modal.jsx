import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const Modal = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={clsx('relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all', className)}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
