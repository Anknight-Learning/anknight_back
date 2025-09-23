import { connect, type Channel, type ChannelModel } from "amqplib";
import { IMessage } from "../interfaces/IMessage";
import { Logger } from "./Logger";
import pino from "pino";

export class RabbitMQ {
  static instance: RabbitMQ | null = null;

  private logger: pino.Logger = Logger.getInstance();

  public enabled: Number = Number(process.env.MODULE_AUDIO_GENERATOR) || 0;

  private host: string = process.env.RABBITMQ_HOST || "localhost";
  private port: number = Number(process.env.RABBITMQ_PORT) || 5672;
  private user: string = process.env.RABBITMQ_USER || "";
  private password: string = process.env.RABBITMQ_PASS || "";
  private queue: string = process.env.RABBITMQ_QUEUE || "";
  private requeueDays: number = ((Number(process.env.RABBITMQ_REQUEUE_DAYS) < 15 ? Number(process.env.RABBITMQ_REQUEUE_DAYS) : 15) || 15) * 24 * 60 * 60 * 1000;
  private client: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor() { }

  public connect = async (): Promise<void> => {
    try {
      const rabbitURL = `amqp://${this.user}:${this.password}@${this.host}:${this.port}`;

      this.client = await connect(rabbitURL);

      if (!this.client) {
        this.logger.fatal(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      this.channel = await this.client.createChannel();

      await this.channel.assertQueue(this.queue, {
        durable: true,
        messageTtl: this.requeueDays,
        deadLetterExchange: "",
        deadLetterRoutingKey: this.queue
      });

      this.logger.info(`RabbitMQ connected to ${rabbitURL}`)
    } catch (e) {
      this.logger.error(`RabbitMQ service couldn't be connected: ${e}`)
      return;
    }
  }

  public sendMessage = (message: IMessage.Types.Message) => {
    if (!this.channel) return;

    const validMessage = IMessage.Validation.Message.safeParse(message);

    if (!validMessage.success) {
      this.logger.error(`The message data is not valid: ${JSON.parse(validMessage.error?.message)[0].message}`);
      return;
    }

    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(validMessage.data)), { persistent: true });
  }

  public static getInstance = () => {
    if (!RabbitMQ.instance) this.instance = new RabbitMQ();
    return RabbitMQ.instance;
  }
}