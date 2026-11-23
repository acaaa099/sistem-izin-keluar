function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full
          rounded-xl
          border
          border-[#A8B1CE]
          bg-white
          px-4
          py-3
          text-sm
          text-[#1F1F1F]
          placeholder:text-[#696E82]
          outline-none
          transition
          duration-200
          focus:border-[#5A81FA]
          focus:ring-2
          focus:ring-[#CEDEFF]
          disabled:cursor-not-allowed
          disabled:bg-[#F2F4FF]
          ${className}
        `}
      />
    </div>
  );
}

export default Input;