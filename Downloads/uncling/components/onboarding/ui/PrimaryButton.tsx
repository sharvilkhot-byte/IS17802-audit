import React from 'react';

export function PrimaryButton({
    label,
    disabled,
    onClick,
    className = ""
}: {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`mt-6 w-full rounded-xl py-3 text-sm font-medium transition-all duration-300 shadow-sm
        ${disabled ? "bg-[#BFCBC3] text-white cursor-not-allowed" : "bg-[#1F4F3A] text-white hover:bg-[#153428] hover:shadow-md"}
        ${className}`}
        >
            {label}
        </button>
    );
}
