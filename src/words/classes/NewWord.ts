import { IWord } from "../interfaces/IWord"
import { IWordnik } from "../interfaces/IWordnik"

export class NewWord {
  private word: string;
  private searchUrl: URL;
  private pronunciationUrl: URL;
  private frequencyUrl: URL;
  private sourcesMap: Map<String, IWord.Types.WordSource>;

  constructor(word: string) {
    this.word = word;
    this.searchUrl = new URL(`${process.env.WORD_SEARCH_URL}/word.json/${this.word}/definitions?api_key=${process.env.WORDNIK_TOKEN}`);
    this.pronunciationUrl = new URL(`${process.env.WORD_SEARCH_URL}/word.json/${this.word}/pronunciations?api_key=${process.env.WORDNIK_TOKEN}`);
    this.frequencyUrl = new URL(`${process.env.WORD_SEARCH_URL}/word.json/${this.word}/frequency?api_key=${process.env.WORDNIK_TOKEN}`);
    this.sourcesMap = new Map();
  }

  private getPhonetics = async (): Promise<IWord.Types.WordPhonetics> => {
    const res = await fetch(this.pronunciationUrl);

    if (res.status !== 200) throw new Error("The word doesn't be found in the dictionary");

    const data = await res.json();

    const pronunciation = data.filter((item: IWordnik.Types.Pronunciation) => item.rawType === "ahd-5")[0];

    this.sourcesMap.set(pronunciation.rawType, {
      name: pronunciation.attributionText,
      url: pronunciation.attributionUrl
    });

    return {
      text: pronunciation.raw,
      audio: []
    };
  }

  private getDefinitions = async (): Promise<Array<IWord.Types.WordDefinition>> => {
    const res = await fetch(this.searchUrl);
    if (res.status !== 200) throw new Error("The word doesn't be found in the dictionary");

    const data = await res.json()

    return data.map((item: IWordnik.Types.Definition): IWord.Types.WordDefinition | null => {
      if (item.exampleUses.length > 0 && item.sourceDictionary === "ahd-5") {

        this.sourcesMap.set(item.sourceDictionary, {
          name: item.attributionText,
          url: item.attributionUrl
        });

        if (item.wordnikUrl) {
          this.sourcesMap.set("wordnik", {
            name: "wordnik",
            url: item.wordnikUrl
          });
        };

        return {
          partOfSpeech: item.partOfSpeech,
          definition: item.text,
          example: {
            text: item.exampleUses[0].text,
            audio: []
          }
        };
      };

      return null;
    }).filter((item: IWord.Types.WordDefinition) => item !== null);
  }

  private getFrequency = async (): Promise<number> => {
    const res = await fetch(this.frequencyUrl)
    if (res.status !== 200) throw new Error("The word doesn't be found in the dictionary");

    const data = await res.json()

    if (data.totalCount) return data.totalCount
    return 0
  }

  public getWordData = async (): Promise<IWord.Types.Word> => {
    return {
      word: this.word,
      definitions: await this.getDefinitions(),
      phonetics: await this.getPhonetics(),
      sources: Array.from(this.sourcesMap.values()),
      frequency: await this.getFrequency(),
      requested: 0
    }
  }
}