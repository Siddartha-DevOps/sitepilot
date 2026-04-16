import React from 'react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Progress({ value = 0, className = '' }) {
  const safeValue = clamp(Number(value) || 0, 0, 100);

  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <div
        className="h-full bg-orange-500 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

