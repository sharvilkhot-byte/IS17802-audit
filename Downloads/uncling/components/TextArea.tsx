
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, id, className, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className={`block text-sm font-bold mb-2 ml-1 ${error ? 'text-brand-coral' : 'text-brand-deep'}`}>
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={id}
                className={`
            w-full px-5 py-4 
            bg-white/50 backdrop-blur-sm 
            rounded-2xl 
            border
            text-brand-deep placeholder:text-brand-deep/60 
            focus:bg-white focus:border-brand-lavender focus:ring-4 focus:ring-brand-lavender/10 focus:outline-none 
            transition-all duration-300 resize-none
            ${error ? 'border-brand-coral focus:border-brand-coral focus:ring-brand-coral/10' : 'border-brand-rose/20'}
            ${className}
        `}
                {...props}
            />
            {error && <p className="text-brand-coral text-xs mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;
