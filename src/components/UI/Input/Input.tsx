import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>
        {label}
        {props.required && <span className={styles.required}>*</span>}
      </label>
      <input
        {...props}
        className={`${styles.input} ${error ? styles.error : ""} ${
          className || ""
        }`}
        onFocus={(e) => {
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
        }}
      />
      {error ? (
        <p className={styles.errorText}>{error}</p>
      ) : helperText ? (
        <p className={styles.helperText}>{helperText}</p>
      ) : null}
    </div>
  );
};
