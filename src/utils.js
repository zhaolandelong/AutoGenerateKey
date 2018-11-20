const md5 = require('md5');
const translate = require("baidu-translate-api");
const _ = require('lodash');
const camelCase = require('camelcase');

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

async function transByGroups(groups = [], callback) {
  const len = groups.length;
  if (len === 0) return;
  for (let i = 0; i < len; i++) {
    const res = await translate(groups[i], { from: 'zh', to: 'en' });
    const result = _.get(res, 'trans_result.dst', '');
    callback(result);
    await delay(1000);
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

  // console.log(words)
  // console.log(sentences)
  // const wordGroups = groupWords(words.map(wd => wd.txt), 30);
  const wordGroups = words.map(wd => wd.txt);
  const sentenceGroups = sentences.map(wd => wd.txt);
  // console.log(wordGroups)
  // console.log(sentenceGroups)
  // return
  let wordIndex = 0;
  await transByGroups(wordGroups, result => {
    // console.log(result)
    result.split('\n').forEach(wd => {
      words[wordIndex].trans = cleanTxt(camelCase(wd));
      wordIndex += 1;
    });
  });
  // return
  let wsentenceIndex = 0;
  await transByGroups(sentenceGroups, result => {
    // console.log(result)
    sentences[wsentenceIndex].trans = cleanTxt(camelCase(result.split(' ').filter((r, i) => (i < 4)).join(' ')));
    wsentenceIndex += 1;
  });
  // console.log(words)
  // console.log(sentences)
  words.forEach(wd => {
    fileMap[wd.index] = wd;
  });
  sentences.forEach(st => {
    fileMap[st.index] = st;
  });
  // fs.writeFileSync('./full.json', JSON.stringify(data[0], null, 2));
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
