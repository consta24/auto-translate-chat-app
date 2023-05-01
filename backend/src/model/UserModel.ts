export const userSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["username", "password"],
    properties: {
      username: {
        bsonType: "string",
        description: "Username must be a string and is required",
      },
      password: {
        bsonType: "string",
        description: "Password must be a string and is required",
      },
      admin: {
        bsonType: "bool",
        description: "isAdmin must be a boolean and defaults to false",
      },
      contacts: {
        bsonType: "array",
        description: "Contacts must be an array of strings",
        items: {
          bsonType: "string",
        },
      },
    },
  },
};

export class User {
  username: string;
  password: string;
  isAdmin: boolean;
  contacts: string[];

  constructor(
    username: string,
    password: string,
    isAdmin: boolean = false,
    contacts: string[] = []
  ) {
    this.username = username;
    this.password = password;
    this.isAdmin = isAdmin;
    this.contacts = contacts;
  }

  public toString(): string {
    return `User: {
          username: ${this.username},
          password: ${this.password},
          isAdmin: ${this.isAdmin},
          contacts: ${this.contacts}
        }`;
  }
}
