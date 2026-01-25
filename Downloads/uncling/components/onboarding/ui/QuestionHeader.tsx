import React from 'react';

export function QuestionHeader({
    heading,
    subtext,
    pass,
}: {
    heading: string;
    subtext?: string;
    pass?: string;
}) {
    return (
        <div className="mb-6">
            {pass && (
                <p className="text-xs uppercase tracking-wide text-[#8A9A90] mb-2">
                    {pass}
                </p>
            )}
            <h1 className="font-[Nunito] text-[26px] text-[#1E2A23] leading-snug">
                {heading}
            </h1>
            {subtext && (
                <p className="mt-2 font-[Nunito] text-[15px] text-[#5F6F66] leading-relaxed">
                    {subtext}
                </p>
            )}
        </div>
    );
}
