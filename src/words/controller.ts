import { Context } from "hono"
import { NewWord } from "./classes/NewWord"
import Word from "./schemas/Word"
import { ApiWord } from "./classes/ApiWord"
import { IFilters } from "./interfaces/IFilters"
import { RabbitMQ } from "./classes/RabbitMQ"
import { IMessage } from "./interfaces/IMessage"
import { IWord } from "./interfaces/IWord"

const listWords = async (c: Context) => {
  const page: number = Number(c.req.query("page")) - 1 || 0;
  const limit: number = Number(c.req.query("limit")) || 20;
  const word: string = c.req.query("text") || "";
  const orders: Array<string> = c.req.queries("order") || [];
  const errors: Array<{ type: string, field: string, message: string }> = [];
  const sortWords: any = {};

  /** Gets the sort aggregate object from the query params */
  orders.forEach((order: string) => {
    const sort = order.split("-");

    if (sort.length != 2) errors.push({ type: "Filters", field: order, message: `Malformed query parameter: ${order}. Must be like 'mostused-ASC'` });

    const validField = IFilters.Validation.SortTypes.safeParse(sort[0]);
    const validType = IFilters.Validation.OrderTypes.safeParse(sort[1]);

    if (validField.success && validType.success) {
      const field: IFilters.Types.SortTypes = validField.data;
      const type: IFilters.Types.OrderTypes = validType.data;

      const realField: string = IFilters.MappingSort[field];
      const realOrder: number = IFilters.MappingOrder[type];

      sortWords[realField] = realOrder;
    }

    if (!validField.success) errors.push({ type: "Filters", field: "Sort type", message: `${JSON.parse(validField.error?.message)[0].message}, param ${sort[0]} getted` });
    if (!validType.success) errors.push({ type: "Filters", field: "Order", message: `${JSON.parse(validType.error?.message)[0].message}, param ${sort[1]} getted` });
  });

  const words = await Word.aggregate([
    {
      $match: { word: { $regex: word, $options: "i" } }
    },
    {
      $facet: {
        words: [
          { $sort: Object.values(sortWords).length > 0 ? sortWords : { requested: -1, frequency: -1 } },
          {
            $project: {
              _id: 0,
              word: 1,
              part_of_speech: { $arrayElemAt: ["$definitions.partOfSpeech", 0] },
              definition: { $arrayElemAt: ["$definitions.example.text", 0] },
              definition_count: { $size: "$definitions" },
              frequency: 1,
              requested: 1,
              d_updated: 1,
            }
          },
          { $skip: limit * page },
          { $limit: limit },
        ],
        metadata: [
          { $count: "words_found" },
          {
            $addFields: {
              "page": (page + 1),
              "word_offset": page * limit,
              "pages_number": { $ceil: { $divide: ["$words_found", limit] } },
            }
          },
        ],
      }
    }
  ]);

  if (words[0].words.length == 0) {
    c.status(404);
    return c.json({ message: "The page requested doesn't exist" });
  }

  return c.json({ ...words[0], errors });
}

const searchWord = async (c: Context) => {
  const word = c.req.param("word");
  const rabbit = RabbitMQ.getInstance();

  try {
    const dbWord = await Word.findOneAndUpdate({ "word": word }, { "$inc": { requested: 1 } }, { new: true });

    if (dbWord) return c.json(new ApiWord(dbWord).getStructuredWord());

    try {
      const wordnikWord = await new NewWord(word).getWordData();
      const savedWord: IWord.Types.DB.Word = await Word.insertOne(wordnikWord);

      if (savedWord && rabbit && rabbit.enabled) {

        const phoneticsID = savedWord.phonetics._id;

        const rabbitMessage: IMessage.Types.Message = {
          word: word,
          text: word,
          field_name: "phonetics",
          field_id: phoneticsID ? phoneticsID.toString() : ""
        }

        rabbit.sendMessage(rabbitMessage);
      }

      return c.json(new ApiWord(savedWord).getStructuredWord());
    } catch (e) {
      c.status(404);
      return c.json({ message: `The word ${word} hasn't been found` })
    }
  } catch (e) {
    c.status(404);
    return c.json({ message: `The word ${word} hasn't been found` })
  }
}

export { listWords, searchWord };