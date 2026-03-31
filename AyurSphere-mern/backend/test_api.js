const axios = require('axios');
const mirrors = [
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
  'https://trans.zillyhuhn.com/translate',
  'https://translate.mentality.rip/translate',
  'https://libretranslate.pussthecat.org/translate'
];

async function test() {
  for (const url of mirrors) {
    try {
      const res = await axios.post(url, { q: "Hello", source: "en", target: "es", format: "text" });
      if (res.data && res.data.translatedText) {
        console.log("WORKING:", url);
        return;
      }
    } catch (e) {}
  }
}
test();
