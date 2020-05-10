module.exports = {
  env: {
    dev: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
        '@babel/preset-typescript'
      ]
    },
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }
  }
};
