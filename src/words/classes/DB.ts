import mongoose from "mongoose";
import Accent from "../schemas/Accent";
import { Logger } from "./Logger";

export class DB {
  static instance: DB | null = null;
  private uri: string
  private logger = Logger.getInstance()?.logger;

  constructor() {
    this.uri = process.env.MONGO_URI || "";
  }

  public connect = async () => {
    try {
      await mongoose.connect(this.uri);
      this.logger.info(`Mongoose connected to ${this.uri}`);
    } catch (e) {
      this.logger.error(`The database couldn't be connected`);
      return;
    }
  }

  public initializeDB = async () => {
    const accent = await Accent.findOne();

    if (!accent) {
      this.logger.info("No accents found, creating default accent")

      const newAccent = await Accent.insertOne({
        name: process.env.DEFAULT_ACCENT_NAME,
        language: process.env.DEFAULT_ACCENT_LANGUAGE,
        voice_id: process.env.DEFAULT_ACCENT_VOICE_ID,
        is_active: true
      });

      this.logger.info(`Default accent created: ${newAccent.name}`);
    }
  }

  public static getInstance = () => {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }
}