import { Context } from "hono"
import { getWordDefinition } from "./utils/getWordDefinition"

const listWords = async (c: Context) => {
  console.log("hola")
}

const searchWord = async (c: Context) => {

  const word = c.req.param("word")
  const definition = await getWordDefinition(word)

  if (definition == null) return c.status(404)

  return c.json(definition)
}

export { listWords, searchWord };