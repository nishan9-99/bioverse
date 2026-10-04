import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Password field with a show/hide toggle button.
 * Accepts the same props as a normal <input> (value, onChange, placeholder, etc.).
 */
export default function PasswordInput({ id, className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
        autoComplete="new-password"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-cyan-400 transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
