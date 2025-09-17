import { Hono } from 'hono'
import words from './words/routes'
import { Rabbit } from './words/classes/Rabbit'
import { DB } from './words/classes/DB'
import { Logger } from './words/classes/Logger'

const start = async () => {
  const logger = Logger.getInstance()?.logger;

  if (!logger) {
    console.log("The logger service is not working");
    process.exit(1);
  }

  try {
    const rabbit = Rabbit.getInstance();
    const db = DB.getInstance()

    try {
      if (rabbit && rabbit.enabled) rabbit.connect();
      await db.connect();
    } catch (e) {
      logger.fatal(e);
      process.exit(1);
    }

    const app = new Hono();
    const api = new Hono();

    app.route("/words", words);
    api.route("/api/v1", app);

    return {
      port: 3456,
      fetch: api.fetch
    }
  } catch (e) {
    logger.fatal(e);
    process.exit(1);
  }
}

export default await start()