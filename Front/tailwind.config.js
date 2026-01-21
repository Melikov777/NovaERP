export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fffbea',
                    100: '#fff4c5',
                    200: '#ffeb85',
                    300: '#ffde46',
                    400: '#ffd000',
                    500: '#e6bb00', // Reference
                    DEFAULT: '#FFD800', // 1C Yellow
                    600: '#c29d00',
                    700: '#a38400',
                    800: '#856b00',
                    900: '#6b5600',
                    950: '#423500',
                },
                oneC: {
                    yellow: '#FFD800',
                    bg: '#FAFAFA',
                    header: '#FCE94F',
                    border: '#CCCCCC',
                    text: '#333333',
                    panel: '#FFFFFF',
                    sidebar: '#F2F2F2'
                },
                dark: {
                    bg: '#1e1e1e',
                    surface: '#2d2d2d',
                    border: '#3e3e3e'
                }
            },
            fontFamily: {
                sans: ['Arial', 'Helvetica', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
