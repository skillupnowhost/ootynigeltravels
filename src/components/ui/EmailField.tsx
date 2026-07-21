"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { validateEmail } from "@/lib/validation/email";

export interface EmailValueInfo {
  value: string;
  valid: boolean;
  error: string | null;
}

interface EmailFieldProps {
  name: string;
  required?: boolean;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  onValueChange?: (info: EmailValueInfo) => void;
  size?: "sm" | "md";
}

/** Real-time-validated email input — green check / red error icon as the user types, strict rules on blur. */
export function EmailField({
  name,
  required = false,
  placeholder = "name@company.com",
  icon,
  className = "",
  onValueChange,
  size = "md",
}: EmailFieldProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => validateEmail(value), [value]);
  const showFeedback = value.includes("@");

  useEffect(() => {
    onValueChange?.({ value: result.normalized || value.trim(), valid: result.valid, error: result.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.valid, result.normalized, value]);

  const sizeClasses = size === "sm" ? "text-sm" : "text-sm";

  return (
    <div className={className}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">{icon}</span>
        )}
        <input
          type="email"
          name={name}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            const trimmed = value.trim();
            if (trimmed !== value) setValue(trimmed);
            setTouched(true);
          }}
          placeholder={placeholder}
          className={`input-field ${icon ? "pl-10" : ""} pr-10 ${sizeClasses} ${
            touched && showFeedback && value && !result.valid
              ? "border-red-400 focus:border-red-500"
              : touched && result.valid
                ? "border-forest-400"
                : ""
          }`}
        />
        {value.length > 0 && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {result.valid ? (
              <Check size={16} className="text-forest-600" />
            ) : showFeedback ? (
              <AlertCircle size={16} className="text-red-500" />
            ) : null}
          </span>
        )}
      </div>
      {touched && showFeedback && value && result.error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {result.error}
        </p>
      )}
    </div>
  );
}
