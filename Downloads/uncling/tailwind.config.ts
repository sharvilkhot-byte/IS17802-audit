import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./index.html"],
    theme: {
        extend: {
            colors: {
                background: "#FAFBF9",
                surface: "#FFFFFF",
                border: "#E6EAE4",

                forest: "#1F4F3A",
                moss: "#4F7C67",
                sage: "#DCE8E0",

                calm: "#D8E7F0",
                low: "#EFE3E3",
                tense: "#F3E8D9",
                safe: "#E6F2EC",

                textPrimary: "#1E2A23",
                textSecondary: "#5F6F66",
                textMuted: "#8A9A90",
            },
            borderRadius: {
                xl: "20px",
                "2xl": "28px",
                emotional: "32px",
            },
            boxShadow: {
                soft: "0 6px 20px rgba(0,0,0,0.06)",
                lift: "0 10px 30px rgba(0,0,0,0.08)",
            },
        },
    },
    plugins: [],
} satisfies Config;
