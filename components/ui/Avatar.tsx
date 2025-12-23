import React from 'react';

interface AvatarProps {
    src: string;
    alt: string;
    size?: string;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'size-10', className = '' }) => (
    <div
        className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full border border-neutral-100 dark:border-gray-700 ${size} ${className}`}
        role="img"
        aria-label={alt}
        style={{ backgroundImage: `url("${src}")` }}
    ></div>
);