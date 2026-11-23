function Button({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        rounded-xl
        bg-[#5A81FA]
        px-4
        py-3
        text-sm
        font-semibold
        text-white
        transition
        duration-200
        hover:bg-[#2B308B]
        focus:outline-none
        focus:ring-2
        focus:ring-[#5A81FA]
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;