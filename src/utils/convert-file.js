
function joinZh2enIntoPlatform(zh2en, originPlatfoem) {
  const platform = originPlatfoem;
  Object.keys(platform).forEach(key => {
    const value = platform[key];
    if (Object.hasOwnProperty.call(zh2en, value['zh-CN'])) {
      value['en-US'] = zh2en[value['zh-CN']];
    }
  });
  return platform;
}

function checkPlatform(platform) {
  const platformFit = {};
  const platformRemain = {};
  Object.keys(platform).forEach(key => {
    if (platform[key]['en-US'] === '') {
      platformRemain[key] = platform[key];
    } else {
      platformFit[key] = platform[key];
    }
  });
  return {
    platformFit,
    platformRemain
  }
}

function checkZh2en(zh2en, platformFit) {
  const zh2enFit = {};
  const zh2enRemain = {};
  Object.values(platformFit).forEach(value => {
    const zh2enKey = value['zh-CN'];
    if (Object.hasOwnProperty.call(zh2en, zh2enKey)) {
      zh2enFit[zh2enKey] = zh2en[zh2enKey];
    }
  });
  Object.keys(zh2en).forEach(key => {
    if (!Object.hasOwnProperty.call(zh2enFit, key)) {
      zh2enRemain[key] = zh2en[key];
    }
  });
  return {
    zh2enFit,
    zh2enRemain
  }
}

function checkOrigin(origin, zh2enFit) {
  const originFit = origin.map(({ file, map }) => {
    return {
      file,
      map: map.filter(({ content }) => Object.hasOwnProperty.call(zh2enFit, content))
    };
  }).filter(({ map }) => map.length > 0);
  const originRemain = origin.map(({ file, map }) => {
    return {
      file,
      map: map.filter(({ content }) => !Object.hasOwnProperty.call(zh2enFit, content))
    };
  }).filter(({ map }) => map.length > 0);
  return {
    originFit,
    originRemain
  }
}

function mergePlatform(origin, input) {
  const _origin = JSON.parse(JSON.stringify(origin));
  Object.keys(input).forEach(key=>{
    _origin[key] = input[key];
  });
}

module.exports = {
  joinZh2enIntoPlatform,
  checkPlatform,
  checkZh2en,
  checkOrigin,
  mergePlatform
}