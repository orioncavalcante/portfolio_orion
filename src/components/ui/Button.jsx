export function Button({ children, href, onClick, variant = 'primary', className = '' }) {
  const baseStyle = "inline-flex items-center justify-center font-mono font-bold px-6 py-3 border-2 border-black transition-transform active:translate-x-[2px] active:translate-y-[2px]";
  
  const variants = {
    primary: "bg-[#DE1B1B] text-white shadow-[4px_4px_0px_#000] hover:bg-red-700",
    secondary: "bg-white text-black shadow-[4px_4px_0px_#000] hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white dark:border-zinc-600 dark:shadow-[4px_4px_0px_#fff]",
  };

  const classes = `${baseStyle} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}