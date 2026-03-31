const axios = require('axios');
const mirrors = [
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
  'https://trans.zillyhuhn.com/translate',
  'https://translate.mentality.rip/translate',
  'https://libretranslate.pussthecat.org/translate',
  'https://translate.terraprint.co/translate',
  'https://traduko.fedsys.co.uk/translate'
];

async function test() {
  for (const url of mirrors) {
    try {
      console.log('Testing', url);
      const res = await axios.post(url, { q: "Hello my friend", source: "en", target: "es", format: "text" }, { timeout: 4000 });
      if (res.data && res.data.translatedText) {
        console.log("WORKING:", url);
      }
    } catch (e) {
      console.log("Failed:", url);
    }
  }
}
test();
