import { z } from "zod";

export namespace IWordnik {
  const Pronunciation = z.object({
    seq: z.number(),
    raw: z.string(),
    rawType: z.string(),
    id: z.string().nullable().optional(),
    attributionText: z.string(),
    attributionUrl: z.string()
  })

  const Definition = z.object({
    id: z.string(),
    partOfSpeech: z.string(),
    attributionText: z.string(),
    sourceDictionary: z.string(),
    text: z.string(),
    sequence: z.string(),
    score: z.number(),
    word: z.string(),
    attributionUrl: z.string(),
    wordnikUrl: z.string(),
    citations: z.array(z.string()),
    exampleUses: z.array(z.object({ text: z.string() })),
    labels: z.array(z.string()),
    notes: z.array(z.string()),
    relatedWords: z.array(z.string()),
    textProns: z.array(z.string())
  })

  export const Validation = { Pronunciation, Definition };

  export namespace Types {
    export type Pronunciation = z.infer<typeof Pronunciation>
    export type Definition = z.infer<typeof Definition>
  }
}