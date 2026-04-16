import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

const variantClasses = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
};

const sizeClasses = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-5 text-sm',
};

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

