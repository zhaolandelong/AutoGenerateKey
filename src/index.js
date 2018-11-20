const fs = require('fs');
const { transFile, formatLangMap } = require('./utils');
const data = require('./test.json');

(async () => {
  for (let i = 0; i < data.length; i++) {
    console.log(i, data[i].file, 'start')
    await transFile(data[i].map);
    fs.writeFile('./extend-data.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.log(err)
      }
    });
    console.log(i, data[i].file, 'finish')
    console.log('===========================')
  }
  // await transFile(data[1].map);

  const langMap = formatLangMap(data);
  // console.log(langMap)
  fs.writeFile('./lang-map.json', JSON.stringify(langMap, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  });
})()

