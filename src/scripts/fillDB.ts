import { sleep } from "bun";
import { MongoDB } from "../words/classes/MongoDB";
import Word from "../words/schemas/Word";
import WordInvalid from "../words/schemas/WordInvalid";

const letters = "abcdefghiefghijklmnopqrstuvwxyz";
const url = "http://www.mso.anu.edu.au/~ralph/OPTED/v003/wb1913_";
const host = "http://localhost:3456"

const run = async () => {
  MongoDB.getInstance().connect();

  let currentWord = "";

  for (const letter of letters) {
    const res = await fetch(`${url}${letter}.html`);
    const data = await res.text();
    const words = data.split("<P>");

    for (const word of words) {

      const regex = /<B>(.*)<\/B>/;
      const match = regex.exec(word);

      if (match) {
        const newWord = match[1];

        if (newWord === currentWord) continue;

        const wordDB = await Word.findOne({ word: newWord.toLowerCase() });
        if (wordDB && wordDB.word === newWord.toLowerCase()) continue;

        const wordInvalidDB = await WordInvalid.findOne({ word: newWord.toLowerCase() });
        if (wordInvalidDB && wordInvalidDB.word === newWord.toLowerCase()) continue;

        currentWord = newWord;

        await sleep((Math.random() * 20000) + 5000);
        console.log(`Fetching word: ${newWord}`);
        const resAPI = await fetch(`${host}/api/v1/words/${newWord?.toLowerCase()}`);

        if (resAPI.status !== 200) {
          console.log(resAPI.status);
          await WordInvalid.insertOne({ word: newWord.toLowerCase() });
          continue;
        };

        const data = await resAPI.json();
        console.log(`${data.word}: ${data.definitions[0].definition}`);
      }
    }
  }
}

run();