/* jshint node:true, undef:true, unused:true */

var libpath = require('path');
var libfs = require('fs');
var libmodule = require('module');
var ModuleClass = require('es6-module-transpiler/lib/module');

/**
 * Provides resolution of npm modules with `jsnext:main` directive from module import sources.
 *
 * @constructor
 */
function FileResolver(paths) {
  this.rootPath = (paths && paths.length ? paths[0] : process.cwd()); // top level module in the npm tree
}

/**
 * Resolves `importedPath` imported by the given module `fromModule` to a
 * npm module.
 *
 * @param {string} importedPath
 * @param {?Module} fromModule
 * @param {Container} container
 * @return {?Module}
 */
FileResolver.prototype.resolveModule = function(importedPath, fromModule, container) {
  if (importedPath.charAt(0) !== '.') {
    console.log('INFO: External module detected: "%s"', importedPath);
    var resolvedPath = this.resolvePath(importedPath, fromModule);
    if (resolvedPath) {
      var cachedModule = container.getCachedModule(resolvedPath);
      if (cachedModule) {
        return cachedModule;
      } else {
        console.log('INFO: External module found at: "%s"', resolvedPath);
        return new ModuleClass(resolvedPath, importedPath, container);
      }
    }
  }
  return null;
};

/**
 * Resolves `importedPath` against the importing module `fromModule`, if given,
 * within this resolver's paths.
 *
 * @private
 * @param {string} importedModuleName
 * @param {?Module} fromModule
 * @return {string}
 */
FileResolver.prototype.resolvePath = function(importedModuleName, fromModule) {
  var main, resolved,
    parentPackagePath = this.resolvePackage(fromModule ? fromModule.path : this.rootPath),
    packagePath, pkg;

  if (!parentPackagePath) {
    console.error('ERROR: Parent module not found for: "%s"', importedModuleName);
    return null;
  }

  try {
    packagePath = this.resolvePackage(libmodule._resolveFilename(importedModuleName, libmodule._cache[parentPackagePath]));
  } catch (e1) {
    console.error('ERROR: Unable to resolve package information for module: "%s"', importedModuleName);
    return null;
  }

  try {
    pkg = require(packagePath);
    main = pkg["jsnext:main"].toString();
  } catch (e) {
    console.error('ERROR: External module without "jsnext:main" directive at: "%s"', importedModuleName);
    return null;
  }

  resolved = libpath.resolve(libpath.dirname(packagePath), main);
  if (libfs.existsSync(resolved)) {
    return resolved;
  }

  console.error('ERROR: Lookup fails for module "%s" at "%s"', importedModuleName, resolved);
  return null;
};

/**
 * Resolves the fullpath to the nearest `package.json` for a given module path.
 *
 * @private
 * @param {string} modulePath
 * @return {string}
 */
FileResolver.prototype.resolvePackage = function(modulePath) {
  var paths = libmodule._nodeModulePaths(libpath.dirname(modulePath)),
    i, p;

  for (i = 0; i < paths.length; i++) {
    p = libpath.resolve(paths[i], '../package.json');
    if (libfs.existsSync(p)) {
      require(p);
      return p;
    }
  }

  return null;
};

module.exports = FileResolver;
