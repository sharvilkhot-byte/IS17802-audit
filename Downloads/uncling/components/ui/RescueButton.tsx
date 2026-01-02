

export function RescueButton({ onClick }: { onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="
        bg-safe
        text-forest
        rounded-2xl
        px-6
        py-4
        text-base
        font-medium
        shadow-soft
      "
        >
            I need support right now
        </button>
    );
}
