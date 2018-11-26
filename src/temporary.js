const fs = require('fs');
const path = require('path');
const {
  joinZh2enIntoPlatform, checkPlatform, checkZh2en, checkOrigin, mergePlatform,
  transFile, formatLangMap
} = require('./utils');
function writeFile(filePath, data, basicPath = '') {
  fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    err => err && console.log(err)
  );
}

function p(fileName) {
  const basicPath = '../data/bee/'
  return path.resolve(__dirname, basicPath, fileName);
}


const zh2en = require(p('zh2en.json'));
const originPlatform = require(p('platform.json'));
const origin = require(p('origin.json'));


const finalPlatform = joinZh2enIntoPlatform(zh2en, originPlatform);

writeFile(p('platform.json'), finalPlatform);


const { platformFit, platformRemain } = checkPlatform(finalPlatform);

writeFile(p('platform-fit.json'), platformFit);
writeFile(p('platform-remain.json'), platformRemain);


const { zh2enFit, zh2enRemain } = checkZh2en(zh2en, platformFit);

writeFile(p('zh2en-fit.json'), zh2enFit);
writeFile(p('zh2en-remain.json'), zh2enRemain);


const { originFit, originRemain } = checkOrigin(origin, zh2enFit);

writeFile(p('origin-fit.json'), originFit);
writeFile(p('origin-remain.json'), originRemain);
