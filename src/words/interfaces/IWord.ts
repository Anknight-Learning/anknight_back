import { Types } from "mongoose";
import { z } from "zod";

/**
 * Word interfaces and Zod objects
 */
export namespace IWord {

  /** Word Schemas */

  const ObjectIdSchema = z.instanceof(Types.ObjectId);

  const WordText = z.string()

  const WordDefinition = z.object({
    partOfSpeech: z.string(),
    definition: z.string(),
    example: z.object({
      text: z.string(),
      audio: z.array(z.object({
        accent: z.string().optional().nullable(),
        url: z.url().optional().nullable()
      }).optional().nullable()).optional()
    })
  });

  const WordPhonetics = z.object({
    text: z.string(),
    audio: z.array(z.object({
      accent: z.string().optional().nullable(),
      url: z.url().optional().nullable()
    }).optional().nullable())
  });

  const WordSource = z.object({
    name: z.string(),
    url: z.string()
  });

  const WordFrecuency = z.number()

  const WordRequested = z.number()

  const Word = z.object({
    word: WordText,
    definitions: z.array(WordDefinition),
    phonetics: WordPhonetics,
    sources: z.array(WordSource),
    frequency: WordFrecuency,
    requested: WordRequested
  })

  /** Database Word Schemas */
  const DBWordDefinition = WordDefinition.extend({ _id: ObjectIdSchema });
  const DBWordSource = WordSource.extend({ _id: ObjectIdSchema });
  const DBWordPhonetics = WordPhonetics.extend({ _id: ObjectIdSchema.optional().nullable() })
  const DBWord = Word.extend({
    _id: ObjectIdSchema,
    phonetics: DBWordPhonetics,
    definitions: z.array(DBWordDefinition),
    sources: z.array(DBWordSource),
    d_creation: z.date(),
    d_updated: z.date()
  });

  export const Validation = {
    WordText,
    WordDefinition,
    WordPhonetics,
    WordFrecuency,
    WordRequested,
    WordSource,
    Word,
    DBWordDefinition,
    DBWordSource,
    DBWord
  }

  export namespace Types {
    export type WordText = z.infer<typeof WordText>
    export type WordDefinition = z.infer<typeof WordDefinition>
    export type WordPhonetics = z.infer<typeof WordPhonetics>
    export type WordSource = z.infer<typeof WordSource>
    export type WordFrecuency = z.infer<typeof WordFrecuency>
    export type WordRequested = z.infer<typeof WordRequested>
    export type Word = z.infer<typeof Word>

    export namespace DB {
      export type WordDefinition = z.infer<typeof DBWordDefinition>
      export type WordSource = z.infer<typeof DBWordSource>
      export type Word = z.infer<typeof DBWord>
    }
  }
}