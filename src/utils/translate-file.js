const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const translate = require("baidu-translate-api");
const _ = require('lodash');
const camelCase = require('camelcase');
const translateCache = require('./translate-cache.json');

const FILTER_CHARS = [
  /[|\\\/\(\)\[\]\{\}\s\%]/g, // base
  /[:'",.?~]/g, // en
  /[：“”‘’，。？、～]/g, // zh
  /\{[^\}]+\}/g, // { ** }
  /<[^>]+>/g,// html
];

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

function zh2hash(txt, hashLen = 6) {
  return md5(txt).substr(0, hashLen)
}

function cleanTxt(txt) {
  FILTER_CHARS.forEach((reg) => {
    txt = txt.replace(reg, '');
  });
  return txt;
}

function groupWords(wordsArr = [], groupSize = 10) {
  const finalArr = [];
  let tmpWordArr = [];
  for (let i = 1; i <= wordsArr.length; i++) {
    tmpWordArr.push(wordsArr[i - 1]);
    if (i % groupSize === 0 || i === wordsArr.length) {
      finalArr.push(tmpWordArr.join('\n'));
      tmpWordArr = [];
    }
  }
  return finalArr;
}

async function translateByGroup(groups = [], callback) {
  const len = groups.length;
  if (len === 0) return;
  for (let i = 0; i < len; i++) {
    let result;
    if (Object.hasOwnProperty.call(translateCache, groups[i])) {
      result = translateCache[groups[i]];
    } else {
      const res = await translate(groups[i], { from: 'zh', to: 'en' });
      result = _.get(res, 'trans_result.dst', '');
      translateCache[groups[i]] = result;
      fs.writeFile(path.resolve(__dirname, './translate-cache.json'), JSON.stringify(translateCache, null, 2), (err) => err && console.log(err));
      await delay(1000);
    }
    callback(result);
  }
}

async function transFile(fileMap) {
  const words = [];
  const sentences = [];
  fileMap.map(({ content }, index) => ({
    content,
    index,
  })).forEach((obj) => {
    obj.hash = zh2hash(obj.content);
    obj.txt = cleanTxt(obj.content);
    if (obj.txt.length > 6) {
      sentences.push(obj);
    } else {
      words.push(obj);
    }
  });

  const wordGroups = words.map(wd => wd.txt);
  let wordIndex = 0;
  await translateByGroup(wordGroups, result => {
    result.split('\n').forEach(wd => {
      words[wordIndex].trans = cleanTxt(camelCase(wd));
      wordIndex += 1;
    });
  });

  const sentenceGroups = sentences.map(wd => wd.txt);
  let wsentenceIndex = 0;
  await translateByGroup(sentenceGroups, result => {
    sentences[wsentenceIndex].trans = cleanTxt(camelCase(result.split(' ').filter((r, i) => (i < 4)).join(' ')));
    wsentenceIndex += 1;
  });

  words.forEach(wd => {
    fileMap[wd.index] = wd;
  });

  sentences.forEach(st => {
    fileMap[st.index] = st;
  });
}

function formatLangMap(data) {
  const langMap = {};
  data.forEach(da => {
    da.map.forEach(({ hash, content, trans, txt }) => {
      const key = `${txt.length > 6 ? 'long' : 'word'}-${trans}-${hash}`;
      if (!Object.hasOwnProperty.call(langMap, key)) {
        langMap[key] = {
          "en-US": "",
          "zh-CN": content
        }
      }
    })
  });
  return langMap;
}

module.exports = {
  transFile,
  formatLangMap
}
