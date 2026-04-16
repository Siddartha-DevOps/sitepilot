import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Badge({ className = '', children, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

