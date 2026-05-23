import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading,
      href,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-heading font-bold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94625] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
      primary:
        "bg-t40-black text-white hover:bg-[#d94625]",
      outline:
        "bg-transparent border border-t40-black/20 text-t40-black hover:border-t40-black hover:bg-t40-black hover:text-white",
      ghost:
        "bg-transparent text-t40-black hover:bg-neutral-100",
    };

    const sizes = {
      sm: "px-5 py-2.5 text-[9px]",
      md: "px-8 py-4 text-[10px]",
      lg: "px-10 py-5 text-[11px]",
    };

    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href && !disabled && !isLoading) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";