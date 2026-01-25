import React from 'react';

export function OptionTile({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full rounded-2xl px-4 py-4 text-left text-sm leading-snug transition-all duration-200
        ${selected ? "bg-[#DCE8E0] text-[#1E2A23]" : "bg-[#F0F4EE] text-[#1E2A23] hover:bg-[#E6F2EC]"}`}
        >
            {label}
        </button>
    );
}
