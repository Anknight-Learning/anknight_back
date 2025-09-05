import { Hono } from 'hono'
import words from './words/routes'
import mongoose from 'mongoose'

const start = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log(`Mongoose conectado en ${process.env.MONGO_URI}`)

    const app = new Hono()
    const api = new Hono()

    app.route("/words", words)

    api.route("/api/v1", app)

    return {
      port: 3456,
      fetch: api.fetch
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

export default await start()