import mongoose from "mongoose";

const WordInvalid = new mongoose.Schema({
  word: String,
})

export default mongoose.model("WordInvalid", WordInvalid);