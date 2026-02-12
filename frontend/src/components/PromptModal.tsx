import { useState, useEffect } from 'react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-slate-300 mb-4">{message}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            autoFocus
            className="input-dark"
          />
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
