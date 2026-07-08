#!/usr/bin/env node

var fs = require('fs-extra');
var path = require('path');

/**
 * Resolves the Cordova project root directory.
 * Prefers process.env.INIT_CWD (set by npm to the directory where npm was
 * invoked) when it contains config.xml. Falls back to walking two levels up
 * from the package root (the traditional node_modules layout).
 *
 * @param  {string} packageRoot - Absolute path to the package root directory
 * @return {string} Absolute path to the Cordova project root
 */
function resolveProjectRoot(packageRoot) {
  if (process.env.INIT_CWD && fs.existsSync(path.join(process.env.INIT_CWD, 'config.xml'))) {
    return process.env.INIT_CWD;
  }
  return path.resolve(packageRoot, '..', '..');
}

/**
 * Normalizes the xml2js hook value to an array.
 * xml2js may return undefined (no hooks), a single object, or an array
 * depending on the number of hook elements in config.xml.
 *
 * @param  {undefined|object|Array} hook - The raw hook value from xml2js
 * @return {Array} An array of hook objects
 */
function normalizeHooks(hook) {
  if (!hook) {
    return [];
  }
  return Array.isArray(hook) ? hook : [hook];
}

module.exports = { resolveProjectRoot: resolveProjectRoot, normalizeHooks: normalizeHooks };
