/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Custom Gradient Colors
        gradientIndigo: "#4F46E5", // Indigo-600
        gradientPurple: "#A855F7", // Purple-500
        gradientPink: "#EC4899",   // Pink-500
        gradientEmerald: "#10B981", // Emerald-500
        gradientAmber: "#F59E0B",  // Amber-500
      },
      // تعريف التدرجات الخطية المخصصة
      backgroundImage: theme => ({
        'hero-gradient': `linear-gradient(to right, ${theme('colors.indigo.400')}, ${theme('colors.purple.400')}, ${theme('colors.pink.400')})`,
        'service-gradient': `linear-gradient(to right, ${theme('colors.indigo.950/40')}, ${theme('colors.purple.950/25')})`,
        'text-gradient-white-gray': `linear-gradient(to right, ${theme('colors.white')}, ${theme('colors.gray.100')}, ${theme('colors.gray.400')})`,
        'check-gradient': `linear-gradient(to right, ${theme('colors.emerald.500/10')}, ${theme('colors.emerald.500/20')})`,
        'scroll-progress': `linear-gradient(to right, ${theme('colors.indigo.500')}, ${theme('colors.purple.500')}, ${theme('colors.pink.500')})`,
      }),
    },
  },
  plugins: [require("tailwindcss-animate")],
};
