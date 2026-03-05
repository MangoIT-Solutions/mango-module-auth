const { createRequire } = require('module');

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const candidatePaths = [];
    if (require.main?.filename) {
      candidatePaths.push(createRequire(require.main.filename));
    }
    if (process.cwd()) {
      candidatePaths.push(createRequire(`${process.cwd()}/package.json`));
    }

    for (const resolver of candidatePaths) {
      try {
        return resolver(name);
      } catch {
        // keep trying
      }
    }

    const message = error instanceof Error ? error.message : 'Module not found';
    throw new Error(
      `${message}. Install "${name}" in the host app or run "npm install" inside @vivek-mango/module-auth when using file: links.`,
    );
  }
}

module.exports = { requireDependency };
