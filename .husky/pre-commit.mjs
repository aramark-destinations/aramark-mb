import { exec } from "node:child_process";

const run = (cmd) => new Promise((resolve, reject) => exec(
  cmd,
  (error, stdout) => {
    if (error) reject(error);
    else resolve(stdout);
  }
));

const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
const modifiedFiles = changeset.split('\n').filter(Boolean);

// compile staged .scss files and stage their compiled .css output
const stagedScss = modifiedFiles.filter((f) => f.endsWith('.scss'));
if (stagedScss.length > 0) {
  console.log('SCSS files staged, compiling...');
  await run('pnpm build:css');
  const compiledCss = stagedScss.map((f) => {
    if (f.startsWith('styles/')) {
      const name = f.substring(f.lastIndexOf('/') + 1).replace('.scss', '.css');
      return `dist/styles/${name}`;
    }
    return f.replace('.scss', '.css');
  });
  await run(`git add ${compiledCss.join(' ')}`);
  console.log('Compiled CSS staged.');
}

// check if component config files were modified alongside model files and stage them
const modifledPartials = modifiedFiles.filter((file) => file.match(/(^|\/)_.*.json/));
if (modifledPartials.length > 0) {
  await run('git add component-models.json component-definition.json component-filters.json');
}

// check if package.json is staged and generate package-lock.json
const packageJsonModified = modifiedFiles.includes('package.json');
if (packageJsonModified) {
  console.log('package.json modified, generating package-lock.json...');
  await run('npm install --package-lock-only');
  try {
    await run('git add package-lock.json');
    console.log('package-lock.json generated and staged');
  } catch {
    console.log('package-lock.json not staged (may be gitignored)');
  }
}
