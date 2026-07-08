#!/usr/bin/env node

//After uninstall script to remove the uglify.js script from the users hooks/after_prepare directory

var fs = require('fs-extra');
var path = require('path');
var xml2js = require('xml2js');

// __dirname = $(project)/node_modules/cordova-uglify/scripts
var packageRoot = path.resolve(__dirname, '..');

// Prefer INIT_CWD (the directory where npm was invoked) when it contains config.xml,
// otherwise fall back to walking two levels up from the package root.
var projectRoot;
if (process.env.INIT_CWD && fs.existsSync(path.join(process.env.INIT_CWD, 'config.xml'))) {
  projectRoot = process.env.INIT_CWD;
} else {
  projectRoot = path.resolve(packageRoot, '..', '..');
}

var uglifyJsPath = path.join(projectRoot, 'hooks', 'after_prepare', 'uglify.js');
var configFilePath = path.join(projectRoot, 'hooks', 'uglify-config.json');

if (fs.existsSync(uglifyJsPath)) {
  fs.unlinkSync(uglifyJsPath);
  console.log('removed ' + uglifyJsPath);
}

if (fs.existsSync(configFilePath)) {
  fs.unlinkSync(configFilePath);
  console.log('removed ' + configFilePath);
}

var cordovaConfigFilePath = path.join(projectRoot, 'config.xml');

function updateCordovaConfig() {
  if (!fs.existsSync(cordovaConfigFilePath)) {
    return;
  }

  var cordovaConfigFileData = fs.readFileSync(cordovaConfigFilePath);

  if (cordovaConfigFileData.indexOf('hooks/after_prepare/uglify.js') === -1) {
    return;
  }

  var parser = new xml2js.Parser();
  parser.parseString(cordovaConfigFileData, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }

    // Normalize hook to an array (xml2js may produce an object for a single entry)
    var hooks = result.widget.hook || [];
    if (!Array.isArray(hooks)) {
      hooks = [hooks];
    }

    var indexToDelete = hooks.findIndex(function(node) {
      return node && node.$ && node.$.src === 'hooks/after_prepare/uglify.js';
    });

    if (indexToDelete !== -1) {
      hooks.splice(indexToDelete, 1);
      result.widget.hook = hooks;
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(result);
      fs.writeFileSync(cordovaConfigFilePath, xml);
    }
  });
}

updateCordovaConfig();
