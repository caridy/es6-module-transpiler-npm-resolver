es6-module-transpiler-npm-resolver
==================================

ES6 Module Transpiler Extension to Resolver from NPM modules with `jsnext:main` flag.

## Overview

ES6 Module Transpiler `es6-module-transpiler` is an experimental compiler that allows you to write your JavaScript using a subset of the current ES6 module syntax, and compile it into various formats. Part of the transpilation process is the validation and resolution process, which is one of the benefits of ES6 modules, reporting static errors if the modules you're trying to import are not available, or the named export that you're referencing to does not exists.

By default, the transpiler implements a relative path resolution process, which means that only modules in a common folder structure are available, while this is good enough for experimentation, it falls short for bigger projects where sharing pieces and sharing components in paramount. This is the reason for `es6-module-transpiler-npm-resolver` exists, it allows to depend on external modules, which are, essentially, npm modules that holds ES6 modules that you can depend on.

[es6-module-transpiler]: https://github.com/square/es6-module-transpiler

## Disclaimer

This resolver DOES NOT provide any interoperability between ES6 modules and CommonJS modules, it is just allow to package ES6 code alongside with the code in an NPM package.

The way of keeping ES6 source code in NPM package is a moving target, and we foresee this changing in the future, for now, we are just sticking to the `jsnext:main` flag.

## Usage

### `jsnext:main` flag

As we mentioned before, transpiler will rely on relative paths to resolve imported modules, e.g.:

```javascript
import foo from "./path/to/foo";
```

Without this resolver, if you want to import a module that was installed by a regular NPM package, you will have to do this:

```javascript
import foo from "./node_modules/foo/path/to/main-es6-module";
```

That's pretty bad, and risky, because there is no guarantee that `foo` is a peer module.

What you want to do is to import a module by relying on the NPM mechanism under the hood, so you can simply do:

```javascript
import foo from "foo";
```

The `es6-module-transpiler-npm-resolver` will use the  mechanism used for node to resolve the closest module called `foo`, and will inspect the `package.json` that describes the package to look for a custom configuration called `jsnext:main`, which is very similar to the regular `main` configuration, but points to a file that represents the main ES6 module implementation. If that flag is not set, the transpiler will throw an lookup error since the module cannot be found. Here is an example for foo:

```json
{
  "name": "foo",
  "version": "0.0.1",
  "main": "index.js",
  "jsnext:main": "path/to/main-es6-module.js"
}
```

### Executable

If you plan to use the `compile-modules` CLI, the resolver can be used directly from the command line:

```
$ npm install -g es6-module-transpiler
$ npm install es6-module-transpiler-npm-resolver
$ compile-modules convert -r ./node_modules/es6-module-transpiler-npm-resolver path/to/module.js -o build/bundle.js
```

__The `-r` option allow you to specify the path or name of the specific resolver.__

### Library

You can also use the resolver with the transpiler as a library:

```javascript
var transpiler = require('es6-module-transpiler');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;
var NPMFileResolver = require('es6-module-transpiler-npm-resolver');
var formatters = require('es6-module-transpiler/lib/formatters');
var Formatter = formatters[formatters.DEFAULT];

var container = new Container({
  resolvers: [new FileResolver(['lib/']), new NPMFileResolver([process.cwd()])],
  formatter: new Formatter()
});

container.getModule('index');
container.write('out/mylib.js');
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Thanks, and enjoy living in the ES6 future!
