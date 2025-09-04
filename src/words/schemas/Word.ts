import mongoose from "mongoose";

const Word = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  definitions: [{
    partOfSpeech: { type: String, required: true },
    definition: { type: String, required: true },
    example: {
      text: { type: String, required: true },
      audio: { type: String }
    }
  }],
  phonetics: {
    text: { type: String, required: true },
    audio: { type: String }
  },
  sources: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true }
    }
  ]
});

export default mongoose.model("Word", Word);