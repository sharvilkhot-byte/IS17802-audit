import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./index.html"],
    theme: {
        extend: {
            colors: {
                // Serenity Palette
                brand: {
                    lavender: '#7D71B8',    // Soft Lavender - Primary (Darkened for accessibility)
                    coral: '#F4A896',       // Warm Coral - Secondary
                    sky: '#B8D8E8',         // Soft Sky Blue
                    cream: '#FFF5EB',       // Warm Cream
                    rose: '#E8C5D8',        // Muted Rose
                    deep: '#5B4E8B',        // Deep Purple - Dark text
                    light: '#FAF8FF',       // Background off-white with purple tint
                },

                // Mapping legacy names to new palette for backward compatibility during refactor
                background: "#FAF8FF",
                surface: "#FFFFFF",
                forest: "#5B4E8B",      // Mapping to Deep Purple
                moss: "#8B7FC7",        // Mapping to Lavender
                sage: "#E8C5D8",        // Mapping to Rose
                lime: {
                    glow: "#B8D8E8",    // Mapping to Sky
                },
                peach: {
                    fuzz: "#F4A896",    // Mapping to Coral
                    mist: "#FFF5EB",    // Mapping to Cream
                },
                textPrimary: "#5B4E8B",
                textSecondary: "#8B7FC7",
                textMuted: "#A397D9",
                border: "#E8C5D8",
            },
            fontFamily: {
                sans: ['Quicksand', 'sans-serif'],
                heading: ['"Playfair Display"', 'serif'],
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                'pill': '9999px',
                emotional: "2rem", // Mapping legacy emotional radius
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(139, 127, 199, 0.15)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                glass: "0 8px 32px 0 rgba(139, 127, 199, 0.1)",
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'breathe': 'breathe 4s ease-in-out infinite',
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                breathe: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' }
                },
                slideUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
