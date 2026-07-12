import util from 'node:util';

const originalStyleText = util.styleText;
util.styleText = function(format, text) {
  if (Array.isArray(format)) {
    let result = text;
    for (const f of format) {
      result = originalStyleText(f, result);
    }
    return result;
  }
  return originalStyleText(format, text);
};

// Now import the vite CLI
import('./node_modules/vite/bin/vite.js');
