import { Hono } from "hono";

import { searchWord, listWords } from "./controller"

const words = new Hono();

words.get("/list", async (c) => listWords(c));

words.get("/search/:word", async (c) => searchWord(c));

export default words;