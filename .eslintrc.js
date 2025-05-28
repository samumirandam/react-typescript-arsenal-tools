module.exports = {
  extends: ['./tools/build-configs/eslint.js'],
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
};
