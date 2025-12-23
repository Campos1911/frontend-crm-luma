import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    primary?: boolean;
    icon?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    primary = false, 
    icon, 
    className = '',
    ...props 
}) => {
    const baseClasses = 'flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-colors duration-200';
    const primaryClasses = 'bg-primary text-white hover:bg-opacity-90 active:bg-opacity-100';
    const secondaryClasses = 'bg-transparent border border-neutral-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-gray-800 pl-3';
    
    return (
        <button 
            className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${className}`}
            {...props}
        >
            {icon && <Icon name={icon} style={{fontSize: '18px'}} />}
            <span className="truncate">{children}</span>
        </button>
    );
};