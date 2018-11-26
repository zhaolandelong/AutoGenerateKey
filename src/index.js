const fs = require('fs');
const { transFile, formatLangMap } = require('./utils');
const origin = require('../data/bee/origin.json');

(async () => {
  for (let i = 0; i < origin.length; i++) {
    console.log(i, origin[i].file, 'start')
    await transFile(origin[i].map);
    fs.writeFile('./data/bee/origin.json', JSON.stringify(origin, null, 2), (err) => err && console.log(err));
    console.log(i, origin[i].file, 'finish')
    console.log('===========================')
  }

  const platform = formatLangMap(origin);
  fs.writeFile('./data/bee/platform.json', JSON.stringify(platform, null, 2), (err) => err && console.log(err));
})()

