'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
    href?: string;
    as?: any; // Escape hatch for motion components
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, href, as, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

        const variants = {
            primary: "bg-gold hover:bg-gold-soft text-black shadow-[0_6px_28px_rgba(212,175,55,0.18)] dark:shadow-[0_6px_28px_rgba(212,175,55,0.18)]",
            secondary: "bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
            ghost: "hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white",
            outline: "border border-gold/20 bg-transparent hover:bg-gold/5 text-white dark:border-gold/20 dark:text-white dark:hover:bg-gold/5",
            danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-4 py-2 text-sm",
            lg: "h-12 px-8 text-base",
        };

        const Component = as || (href ? motion.a : motion.button);

        return (
            <Component
                ref={ref as any}
                href={href}
                whileTap={{ scale: 0.97 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <FiLoader className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </Component>
        );
    }
);
Button.displayName = "Button";

export { Button };
