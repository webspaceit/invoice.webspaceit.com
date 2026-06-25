import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo.png"
            alt={alt ?? 'Logo'}
            className={className}
            {...props}
        />
    );
}
