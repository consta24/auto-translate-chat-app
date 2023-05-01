import { Collection, Db, MongoClient, UpdateFilter } from "mongodb";
import { User, userSchema } from "../model/UserModel";

export class UsersDatabase {
  private mongoDbUri: string;
  private databaseName: string;
  private databaseCollection: string;

  private static instance: UsersDatabase | null = null;
  private client: MongoClient | null = null;
  private database: Db | null = null;
  private collection: Collection<User> | null = null;

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
  ): UsersDatabase {
    if (!UsersDatabase.instance) {
      return new UsersDatabase(mongoDbUri, databaseName, databaseCollection);
    }
    return UsersDatabase.instance;
  }

  public async insertUser(user: User): Promise<boolean> {
    try {
      console.log("Inserted user in database: " + user.toString());
      await this.collection!.insertOne(user);
      return true;
    } catch (err) {
      console.log("UsersDatabase.insertUser(): " + err.message);
      return false;
    }
  }

  public async findUser(username: string): Promise<User | null> {
    try {
      const user = await this.collection!.findOne({ username });
      if (user) {
        return new User(
          user.username,
          user.password,
          user.isAdmin,
          user.contacts
        );
      }
      return null;
    } catch (err) {
      console.log("UsersDatabase.findUser(): " + err.message);
      return null;
    }
  }

  public async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.collection!.find().toArray();
      return users.map(
        (user) => new User(user.username, user.password, user.isAdmin)
      );
    } catch (err) {
      console.log("UsersDatabase.findAllUsers(): " + err.message);
      return [];
    }
  }

  public async addContactToUser(
    username: string,
    contact: string
  ): Promise<boolean> {
    try {
      const updateDocument = {
        $addToSet: { contacts: contact },
      };
      const result = await this.collection?.updateOne(
        { username },
        updateDocument as Partial<User>
      );
      if (result && result.modifiedCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("UsersDatabase.addContactToUser(): " + err.message);
      return false;
    }
  }

  public async deleteUser(user: User) {
    const result = await this.collection!.deleteOne(user);
    return result.deletedCount > 0 ? true : false;
  }

  private async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.mongoDbUri);
      await this.client.connect();
      console.log(
        "Connected to users database: " +
          this.databaseName +
          "->" +
          this.databaseCollection
      );
    } catch (err) {
      console.log("UsersDatabase.connect(): " + err.message);
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
        "Users collection already exists: " + collectionAlreadyCreated
      );
      if (!collectionAlreadyCreated) {
        this.collection = await this.database.createCollection<User>(
          this.databaseCollection,
          {
            validator: userSchema,
          }
        );
        await this.collection.createIndex({ username: 1 }, { unique: true });
      } else {
        this.collection = this.database.collection<User>(
          this.databaseCollection
        );
      }
    } catch (err) {
      console.log(
        "UsersDatabase.createDatabaseAndCollection(): " + err.message
      );
    }
  }
}
