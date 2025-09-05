import { Context } from "hono"
import { NewWord } from "./classes/NewWord"
import Word from "./schemas/Word"
import { ApiWord } from "./classes/ApiWord"

const listWords = async (c: Context) => {

  // TODO: Buscar por texto de la palabra
  // TODO: Ordenar por (ultimas añadidas, popularidad, mas frecuentes)
  // TODO: Meter paginacion

  const words = await Word.aggregate([
    {
      $project: {
        _id: 0,
        word: 1,
        first_definition: { $arrayElemAt: ["$definitions.partOfSpeech", 0] },
        definition_count: { $size: "$definitions" }
      }
    },
    {
      $sort: {
        requested: -1,
        frequency: -1
      }
    }
  ]);

  return c.json(Array.from(words))
}

const searchWord = async (c: Context) => {

  const word = c.req.param("word");

  try {
    const dbWord = await Word.findOneAndUpdate({ "word": word }, { "$inc": { requested: 1 } }, { new: true });

    if (dbWord) return c.json(new ApiWord(dbWord).getStructuredWord());

    try {
      const wordnikWord = await new NewWord(word).getWordData();
      const savedWord = await Word.insertOne(wordnikWord);

      return c.json(new ApiWord(savedWord).getStructuredWord());
    } catch (e) {
      console.log(e);
      return c.status(404);
    }
  } catch (e) {
    console.log(e);
    return c.status(404)
  }
}

export { listWords, searchWord };