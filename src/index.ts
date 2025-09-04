import { Hono } from 'hono'
import words from './words/routes'

const app = new Hono()

app.route("/words", words)

export default {
  port: 3456,
  fetch: app.fetch
}