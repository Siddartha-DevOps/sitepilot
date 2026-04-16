import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={cx('rounded-xl border bg-white shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cx('px-6 pt-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cx('text-base font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cx('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  );
}

