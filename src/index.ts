import { Hono } from 'hono'
import words from './words/routes'
import { RabbitMQ } from './words/classes/RabbitMQ'
import { MongoDB } from './words/classes/MongoDB'
import { Logger } from './words/classes/Logger'

const start = async () => {
  const logger = Logger.getInstance();

  if (!logger) {
    console.log("The logger service is not working");
    process.exit(1);
  }

  try {
    const rabbit = RabbitMQ.getInstance();
    const db = MongoDB.getInstance()

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
      port: Number(process.env.PORT) || 3456,
      fetch: api.fetch
    }
  } catch (e) {
    logger.fatal(e);
    process.exit(1);
  }
}

export default await start()