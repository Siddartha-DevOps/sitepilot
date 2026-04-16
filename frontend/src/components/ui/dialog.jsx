import React, { createContext, useContext } from 'react';

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Dialog({ open = false, onOpenChange = () => {}, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ className = '', children, ...props }) {
  const { open, onOpenChange } = useContext(DialogContext);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cx('w-full rounded-xl bg-white p-6 shadow-xl', className)}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', children, ...props }) {
  return (
    <div className={cx('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children, ...props }) {
  return (
    <h2 className={cx('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogFooter({ className = '', children, ...props }) {
  return (
    <div className={cx('mt-6 flex items-center justify-end gap-2', className)} {...props}>
      {children}
    </div>
  );
}

