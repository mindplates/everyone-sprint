module.exports = {
    parser: 'babel-eslint',
    extends: ['airbnb', 'prettier', 'prettier/react'],
    plugins: ['react', 'prettier'],
    env: {
        browser: true,
        node: true,
        mocha: true,
    },
    rules: {
        'max-length': 0,
        'import/no-unresolved': 0,
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        'react/no-array-index-key': 0,
        'react/jsx-props-no-spreading': 0,
        'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
        'react/sort-comp': 0,
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        'jsx-a11y/label-has-for': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'react/require-default-props': 'off',
        'jsx-a11y/label-has-associated-control' : 'off',
        'jsx-a11y/no-noninteractive-element-interactions' : 'off',
        'no-underscore-dangle' : 'off',
        'jsx-a11y/media-has-caption': 'off',
        'no-param-reassign' : 'off',
    },
};
