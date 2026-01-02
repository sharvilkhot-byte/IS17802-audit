

export function EmotionalCard({
    title,
    description,
    tone = "calm",
}: {
    title: string;
    description: string;
    tone?: "calm" | "low" | "tense" | "safe";
}) {
    return (
        <div
            className={`
        rounded-emotional
        bg-${tone}
        p-6
        shadow-soft
        space-y-2
      `}
        >
            <h3 className="text-lg font-medium text-textPrimary">
                {title}
            </h3>
            <p className="text-sm text-textSecondary leading-relaxed">
                {description}
            </p>
        </div>
    );
}
