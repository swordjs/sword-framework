const fs = require('fs');
const generateTSConfig = (stagedFilenames) => {
  return (type) => {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (stagedFilenames.length === 0) return '';
    tsconfig.include = stagedFilenames;
    fs.writeFileSync('tsconfig.lint.json', JSON.stringify(tsconfig));
    return `${type} --noEmit --project tsconfig.lint.json`;
  };
};

module.exports = {
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix', (fileName) => generateTSConfig(fileName)('tsc')],
  '*.{json,js,jsx}': ['prettier --write', 'eslint --fix']
};
