import { Collection, Db, MongoClient, UpdateFilter } from "mongodb";
import { Message, Messages } from "../model/MessageModel";

export class MessagesDatabase {
  private mongoDbUri: string;
  private databaseName: string;
  private databaseCollection: string;

  private static instance: MessagesDatabase | null = null;
  private client: MongoClient | null = null;
  private database: Db | null = null;
  private collection: Collection<Messages> | null = null;

  private constructor(
    mongoDbUri: string,
    databaseName: string,
    databaseCollection: string
  ) {
    this.mongoDbUri = mongoDbUri;
    this.databaseName = databaseName;
    this.databaseCollection = databaseCollection;

    this.connect();
    this.createDatabaseAndCollection();
  }

  public static getInstance(
    mongoDbUri: string,
    databaseName: string,
    databaseCollection: string
  ): MessagesDatabase {
    if (!MessagesDatabase.instance) {
      return new MessagesDatabase(mongoDbUri, databaseName, databaseCollection);
    }
    return MessagesDatabase.instance;
  }

  private async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.mongoDbUri);
      await this.client.connect();
      console.log(
        "Connected to messages database: " +
          this.databaseName +
          "->" +
          this.databaseCollection
      );
    } catch (err) {
      console.log("MessagesDatabase.connect(): " + err.message);
    }
  }

  public async findRoom(room: string): Promise<Messages | null> {
    try {
      const result = await this.collection!.findOne({ room });
      if (result) {
        const { messages } = result;
        return new Messages(room, messages);
      }
      return null;
    } catch (err) {
      console.log("MessageDatabase.findRoom(): " + err.message);
      return null;
    }
  }

  public async insertMessage(message: Message): Promise<boolean> {
    try {
      const messages = await this.findRoom(message.room);
      if (!messages) {
        const messageArr: Message[] = [];
        messageArr.push(message);
        const messagesObject: Messages = new Messages(message.room, messageArr);
        await this.collection!.insertOne(messagesObject);
      } else {
        messages.messages.push(message);
        await this.collection!.updateOne(
          { room: messages.room },
          { $set: { messages: messages.messages } }
        );
      }
      return true;
    } catch (err) {
      console.log("MessagesDatabase.insertMessage(): " + err.message);
      return false;
    }
  }

  private async createDatabaseAndCollection(): Promise<void> {
    try {
      this.database = this.client!.db(this.databaseName);
      const collections = await this.database.listCollections().toArray();
      const collectionAlreadyCreated = collections.some(
        (collection) => collection.name === this.databaseCollection
      );
      console.log(
        "Messages collection already exists: " + collectionAlreadyCreated
      );
      if (!collectionAlreadyCreated) {
        this.collection = await this.database.createCollection<Messages>(
          this.databaseCollection
        );
        await this.collection.createIndex({ room: 1 }, { unique: true });
      } else {
        this.collection = this.database.collection<Messages>(
          this.databaseCollection
        );
      }
    } catch (err) {
      console.log(
        "MessagesDatabase.createDatabaseAndCollection(): " + err.message
      );
    }
  }
}
