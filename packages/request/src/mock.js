const fs = require('fs');
const path = require('path');

module.exports = async function mock(cwd, dir) {
  const file = path.resolve(cwd, dir);
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};
