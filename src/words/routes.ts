import { Hono } from "hono";

import { searchWord, listWords } from "./controller"

const words = new Hono();

words.get("/", async (c) => listWords(c));

words.get("/:word", async (c) => searchWord(c));

export default words;