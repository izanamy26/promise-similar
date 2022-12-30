module.exports = {
    presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
        'jest',
        '@babel/preset-typescript'
    ],
};