export interface IDefinition {
  partOfSpeech: String;
  definition: String;
  example: {
    text: String;
    audio: String | undefined;
  }
}