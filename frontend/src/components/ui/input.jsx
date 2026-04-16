import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cx(
        'h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400',
        className,
      )}
      {...props}
    />
  );
});

