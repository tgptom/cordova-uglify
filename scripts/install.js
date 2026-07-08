#!/usr/bin/env node

//After install script - installs the cordova hook into hooks/after_prepare directory

//Before
// ./proj
//      /hooks
//      /node_modules
//          /cordova-uglify
//              /after_prepare
//                  /uglify.js
//              /scripts
//                  install.js
//                  uninstall.js

//After
// ./proj
//      /hooks
//          /after_prepare
//              uglify.js
//      /node_modules
//          /cordova-uglify
//              /after_prepare
//                  uglify.js

var fs = require('fs-extra');
var path = require('path');
var xml2js = require('xml2js');
var utils = require('./utils');

// __dirname = $(project)/node_modules/cordova-uglify/scripts
var packageRoot = path.resolve(__dirname, '..');
var projectRoot = utils.resolveProjectRoot(packageRoot);

var hooksDir = path.join(projectRoot, 'hooks');
var afterPrepareDir = path.join(hooksDir, 'after_prepare');

var dirs = [hooksDir, afterPrepareDir];
for (var i = 0; i < dirs.length; i++) {
  if (!fs.existsSync(dirs[i])) {
    console.log('Creating directory: ', dirs[i]);
    fs.mkdirSync(dirs[i]);
  }
}

var uglifyScriptPath = path.join(packageRoot, 'after_prepare', 'uglify.js');
var uglifyAfterPreparePath = path.join(afterPrepareDir, 'uglify.js');
fs.copyFileSync(uglifyScriptPath, uglifyAfterPreparePath);

var uglifyConfigFile = path.join(packageRoot, 'uglify-config.json');
fs.copyFileSync(uglifyConfigFile, path.join(hooksDir, 'uglify-config.json'));

var configFilePath = path.join(projectRoot, 'config.xml');
var configFileData = fs.readFileSync(configFilePath);

var parser = new xml2js.Parser();
parser.parseString(configFileData, function(err, result) {
  if (err) {
    console.log(err);
    return;
  }

  // Normalize hook to an array (xml2js may produce an object for a single entry)
  var hooks = utils.normalizeHooks(result.widget.hook);

  // Only add the hook entry if it does not already exist
  var alreadyExists = hooks.some(function(node) {
    return node && node.$ &&
      node.$.src === 'hooks/after_prepare/uglify.js' &&
      node.$.type === 'after_prepare';
  });

  if (alreadyExists) {
    return;
  }

  hooks.push({
    $: {
      src: 'hooks/after_prepare/uglify.js',
      type: 'after_prepare',
    },
  });
  result.widget.hook = hooks;

  var builder = new xml2js.Builder();
  var xml = builder.buildObject(result);
  fs.writeFileSync(configFilePath, xml);
});
