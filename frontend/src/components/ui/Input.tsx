import { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  floatingLabel?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  floatingLabel = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = `
    w-full px-4 py-3 text-base
    border-2 rounded-lg
    transition-all duration-200
    bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white placeholder:text-[#6F7F95] dark:placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-[#233B6E] focus:ring-opacity-20
    disabled:bg-[#EAF3FB] dark:disabled:bg-[#1c1f2a] disabled:cursor-not-allowed
    ${
      error
        ? "border-[#c62828] focus:border-[#c62828] focus:ring-[#c62828]"
        : "border-[#C9D9EA] dark:border-[#2b2f3b] focus:border-[#233B6E]"
    }
    ${className}
  `;

  if (floatingLabel) {
    return (
      <div className="relative">
        <input
          id={inputId}
          className={`${baseStyles} pt-6 pb-2`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${
              isFocused || hasValue
                ? "top-2 text-xs text-[#233B6E] font-medium"
                : "top-3.5 text-base text-[#6F7F95] dark:text-gray-400"
            }
          `}
        >
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-[#c62828]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-[#6F7F95] dark:text-gray-400">{helperText}</p>}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
          {label}
        </label>
      )}
      <input id={inputId} className={baseStyles} {...props} />
      {error && <p className="mt-1 text-sm text-[#c62828]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[#6F7F95] dark:text-gray-400">{helperText}</p>}
    </div>
  );
}