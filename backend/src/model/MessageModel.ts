export class Messages {
  room: string;
  messages: Message[];

  constructor(room: string, messages: Message[]) {
    this.room = room;
    this.messages = messages;
  }
}

export class Message {
  room: string;
  author: string;
  message: string;
  time: string;

  constructor(room: string, author: string, message: string, time: string) {
    this.room = room;
    this.author = author;
    this.message = message;
    this.time = time;
  }

  public toString(): string {
    return `Message: {
        room: ${this.room},
        author: ${this.author},
        message: ${this.message},
        time: ${this.time}
        }`;
  }
}
