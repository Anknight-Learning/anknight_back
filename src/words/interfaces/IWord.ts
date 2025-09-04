import { IDefinition } from "./IDefinition"
import { IPhonetics } from "./IPhonetics"
import { ISource } from "./ISource"

export interface IWord {
  word: String
  definitions: Array<IDefinition>
  phonetics: IPhonetics
  sources: Array<ISource>
  frequency: Number,
  requested: Number
}