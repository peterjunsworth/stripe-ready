import { fontFamily } from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/react";

module.exports = {
    content: [
        "./app/**/*.tsx",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{ts,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                interLight: ['var(--font-inter-light)', 'sans-serif'],
            },
        },
    },
    darkMode: "class",
    plugins: [
        nextui({
            themes: {
                light: {
                    colors: {
                        primary: {
                            DEFAULT: "#2bd9ae",
                            foreground: "#EEEEEE",
                        },
                        secondary: {
                            DEFAULT: "#cbfff3",
                            foreground: "#EEEEEE",
                        },
                        warning: {
                            DEFAULT: "#FECACA",
                            foreground: "#B91C1C",
                        },
                    },
                },
            },
        }),
    ],
}
