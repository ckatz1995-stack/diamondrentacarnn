export default function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, type = 'button', className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-brand-teal text-white hover:bg-teal-700 focus:ring-brand-teal disabled:opacity-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:opacity-50',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    outline: 'border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white focus:ring-brand-teal',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
