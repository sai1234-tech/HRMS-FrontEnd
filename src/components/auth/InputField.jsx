import React from 'react'

function InputField({ label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  autoComplete,}) {
  return (
    <div className="form-group">

      <label htmlFor={name}>
        {label}

        {required && (
          <span className="required">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={
          error
            ? "input-error"
            : ""
        }
        maxLength={
          name === "name"
            ? 30
            : name === "password" ||
              name === "confirmPassword"
            ? 20
            : undefined
        }
      />

      {error && (
        <small className="error-text">
          {error}
        </small>
      )}

    </div>
  );
};
 

export default InputField
