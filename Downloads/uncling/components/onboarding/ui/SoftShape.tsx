import React from 'react';

export function SoftShape({ color = "#DCE8E0" }) {
    return (
        <div
            className="absolute -top-40 left-1/2 -translate-x-1/2
                 w-[520px] h-[520px] blur-3xl opacity-40 pointer-events-none"
            style={{ backgroundColor: color, borderRadius: "50%" }}
        />
    );
}
