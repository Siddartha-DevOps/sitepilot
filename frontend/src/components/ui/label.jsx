import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Label({ className = '', children, ...props }) {
  return (
    <label className={cx('text-sm font-medium text-slate-700', className)} {...props}>
      {children}
    </label>
  );
}

