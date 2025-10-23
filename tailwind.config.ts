module.exports = {
    theme: {
        extend: {
            keyframes: {
                bounceBlur: {
                    '0%, 100%': {
                        transform: 'translateY(0)',
                        filter: 'blur(0px)',
                    },
                    '50%': {
                        transform: 'translateY(-6px)',
                        filter: 'blur(2px)',
                    },
                },
            },
            animation: {
                bounceBlur: 'bounceBlur 1s ease-in-out infinite',
            },
        },
    },
};
