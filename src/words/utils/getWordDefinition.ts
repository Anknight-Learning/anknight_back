interface Pronunciation {
  seq: Number,
  raw: String,
  rawType: String,
  id: String | undefined,
  attributionText: String,
  attributionUrl: String
}

interface Definition {
  id: String,
  partOfSpeech: String
  attributionText: String
  sourceDictionary: String,
  text: String,
  sequence: String,
  score: Number,
  word: String,
  attributionUrl: String,
  wordnikUrl: String,
  citations: Array<String>,
  exampleUses: Array<{ text: String }>,
  labels: Array<String>,
  notes: Array<String>,
  relatedWords: Array<String>,
  textProns: Array<String>
}

interface NewDefinition {
  partOfSpeech: String,
  definition: String,
  dictType: String,
  dictName: String,
  dictUrl: String,
  wordnikUrl: String,
  example: {
    text: String
  } | undefined
}

interface NewPronunciation {
  phonetics: String,
  dictType: String,
  dictName: String,
  dictUrl: String
}

interface NewSources {
  name: String,
  url: String
}

export const getWordDefinition = async (word: String) => {
  const searchUrl = `${process.env.WORD_SEARCH_URL}/word.json/${word}/definitions?api_key=${process.env.WORDNIK_TOKEN}`
  const pronunciationUrl = `${process.env.WORD_SEARCH_URL}/word.json/${word}/pronunciations?api_key=${process.env.WORDNIK_TOKEN}`
  const frequencyUrl = `${process.env.WORD_SEARCH_URL}/word.json/${word}/frequency?api_key=${process.env.WORDNIK_TOKEN}`

  const resDefinitions = await fetch(searchUrl)
  if (resDefinitions.status !== 200) return null

  const resPronunciation = await fetch(pronunciationUrl)
  if (resPronunciation.status !== 200) return null

  const resFrequency = await fetch(frequencyUrl)
  if (resFrequency.status !== 200) return null


  const definitions = getDefinitions(await resDefinitions.json())
  const pronunciation = getPronunciation(await resPronunciation.json())
  const frequency = (await resFrequency.json()).totalCount
  const sources = definitions && pronunciation ? getWordSources({ definitions, pronunciation }) : []

  const data = { word, definitions, pronunciation, frequency, sources }

  return data
}

const getPronunciation = (data: [Pronunciation]): NewPronunciation => {
  const pronunciation = data.filter((item: Pronunciation) => item.rawType === "ahd-5")[0]

  return {
    phonetics: pronunciation.raw,
    dictType: pronunciation.rawType,
    dictName: pronunciation.attributionText,
    dictUrl: pronunciation.attributionUrl
  }
}

const getDefinitions = (data: Array<Definition>): Array<NewDefinition> | null => {
  return data.map((item: Definition): NewDefinition | null => {
    if (item.exampleUses.length > 0 && item.sourceDictionary === "ahd-5") {
      return {
        partOfSpeech: item.partOfSpeech,
        definition: item.text,
        dictType: item.sourceDictionary,
        dictName: item.attributionText,
        dictUrl: item.attributionUrl,
        wordnikUrl: item.wordnikUrl,
        example: {
          text: item.exampleUses[0].text
        }
      }
    }

    return null
  }).filter(item => item !== null)
}

const getWordSources = ({ definitions, pronunciation }: { definitions: Array<NewDefinition>, pronunciation: NewPronunciation }): Array<NewSources> => {

  const sources = new Map();

  sources.set(pronunciation.dictType, {
    name: pronunciation.dictName,
    url: pronunciation.dictUrl
  })

  for (const definition of definitions) {
    sources.set(definition.dictType, {
      name: definition.dictName,
      url: definition.dictUrl
    })

    if (definition.wordnikUrl) {
      sources.set(definition.wordnikUrl, {
        name: "wordnik",
        url: definition.wordnikUrl
      })
    }
  }

  return Array.from(sources.values());
}

const buildWord = (item: any) => {

}