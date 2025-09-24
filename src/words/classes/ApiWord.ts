import { IWord } from "../interfaces/IWord";

export class ApiWord {
  word: string;
  definitions: Array<IWord.Types.WordDefinition>;
  phonetics: IWord.Types.WordPhonetics;
  sources: Array<IWord.Types.WordSource>;
  frequency: number;
  requested: number;
  d_creation: Date;
  d_updated: Date;

  constructor(item: IWord.Types.DB.Word) {
    this.word = item.word;
    this.definitions = this.getStructuredDefinitions(item.definitions);
    this.phonetics = this.getStructuredPhonetics(item.phonetics);
    this.sources = this.getStructuredSources(item.sources);
    this.frequency = item.frequency;
    this.requested = item.requested;
    this.d_creation = item.d_creation;
    this.d_updated = item.d_updated;
  }

  getStructuredWord() {
    return {
      word: this.word,
      definitions: this.definitions,
      phonetics: this.phonetics,
      frequency: this.frequency,
      requested: this.requested,
      sources: this.sources,
    };
  };

  getStructuredDefinitions(definitions: Array<IWord.Types.DB.WordDefinition>) {
    return definitions.map((definition: IWord.Types.DB.WordDefinition) => {
      return {
        partOfSpeech: definition.partOfSpeech,
        definition: definition.definition,
        example: {
          text: definition.example.text
        }
      };
    });
  };

  getStructuredPhonetics(phonetics: IWord.Types.WordPhonetics) {
    return {
      text: phonetics.text,
      audio: phonetics.audio
    };
  };

  getStructuredSources(sources: Array<IWord.Types.DB.WordSource>) {
    return sources.map((source: IWord.Types.DB.WordSource) => ({
      name: source.name,
      url: source.url
    }));
  }
}