

export function PrimaryButton({ label, onClick }: { label: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="
        bg-forest
        text-white
        rounded-xl
        px-6
        py-3
        text-sm
        font-medium
        hover:bg-moss
        transition
      "
        >
            {label}
        </button>
    );
}
