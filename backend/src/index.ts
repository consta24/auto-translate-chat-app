//-------------------- START OF IMPORTS --------------------\\
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction } from "express";
import session from "express-session";
import http from "http";
import passport from "passport";
import passportLocal from "passport-local";
import { Server } from "socket.io";

import { UsersDatabase } from "./Database/UsersDatabase";
import { Message } from "./model/MessageModel";
import { User } from "./model/UserModel";
import { MessagesDatabase } from "./Database/MessagesDatabase";
//-------------------- END OF IMPORTS --------------------\\

dotenv.config();

//-------------------- START OF DATABASE --------------------\\
const usersDatabase = UsersDatabase.getInstance(
  process.env.MONGODB_URI!,
  process.env.DATABASE_NAME!,
  process.env.DATABASE_COLLECTION_USERS!
);
const messagesDatabase = MessagesDatabase.getInstance(
  process.env.MONGODB_URI!,
  process.env.DATABASE_NAME!,
  process.env.DATABASE_COLLECTION_MESSAGES!
);
//-------------------- END OF DATABASE --------------------\\

//-------------------- START OF MIDDLEWARE --------------------\\
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SECRET_CODE!,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

const isAdministrator = async (
  req: Express.Request,
  res: any,
  next: NextFunction
) => {
  const { user }: any = req;
  if (user) {
    const userFound = await usersDatabase.findUser(user.username);
    if (userFound !== null) {
      if (userFound.isAdmin) {
        next();
      } else {
        res.status(400).send("Only administrators can perform this");
      }
    }
  } else {
    res.status(400).send("User not logged in");
  }
};
//-------------------- END OF MIDDLEWARE --------------------\\

//-------------------- START OF PASSPORT --------------------\\
const LocalStrategy = passportLocal.Strategy;
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await usersDatabase.findUser(username);
    if (!user) {
      return done(null, false);
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.log("passport.use(): " + err.message);
      }
      if (result) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

passport.serializeUser((user: User, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username: string, done) => {
  try {
    const user = await usersDatabase.findUser(username);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
//-------------------- END OF PASSPORT --------------------\\

//-------------------- START OF SOCKET --------------------\\
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket: " + socket.id);

  socket.on("join_room", (data: string) => {
    socket.join(data);
    console.log(`User wih ID: ${socket.id} joined room ${data}`);
  });

  socket.on("send_message", (data: Message) => {
    console.log(`Received message on: ${data.room}, message: ${data.message}`);
    messagesDatabase.insertMessage(data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket: " + socket.id);
  });
});
//-------------------- END OF SOCKET --------------------\\

//-------------------- START OF ROUTES --------------------\\
app.post("/register", async (req, res) => {
  //Request verification before registering
  const { username, password } = req?.body;
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    res
      .status(400)
      .send("Could not register, values introduced are not correct");
    return;
  }
  const user = await usersDatabase.findUser(username);
  if (user) {
    res.status(400).send("User already exists");
    return;
  }
  //End of request verification before registering

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = new User(username, hashedPassword);
  const result: boolean = await usersDatabase.insertUser(newUser);
  if (result) {
    res.status(200).send("User added to database");
  } else {
    res.status(500).send("Error while trying to register the user");
  }
});

app.post("/login", passport.authenticate("local"), async (req, res) => {
  console.log("Auth succesful for: " + req.user);
  const user = await usersDatabase.findUser(req.body?.username);
  res.status(200).send({
    isAdmin: user?.isAdmin,
    message: "Authenticated successfully",
  });
});

app.get("/user", (req, res) => {
  if (req.user) {
    const { password, ...userWithoutPassword } = req.user as User;
    res.send(userWithoutPassword);
  } else {
    res.status(400).send("User not logged in");
  }
});

app.get("/logout", (req, res) => {
  if (!req.user) {
    return res.status(400).send("User not logged in");
  }
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  return res.status(200).send("Logout successfully");
});

app.post("/deleteuser", isAdministrator, async (req, res) => {
  if (!req.body) {
    const logMsg = `Could not find user to delete: [${req.body.username}]`;
    console.log(logMsg);
    res.status(400).send("Could not find user to delete");
    return;
  }
  if (await usersDatabase.deleteUser(req.body)) {
    const logMsg = `User [${req.body.username}] deleted`;
    console.log(logMsg);
    res.status(200).send(`User [${req.body.username}] deleted`);
  } else {
    const logMsg = `Could not delete user: [${req.body.username}]`;
    console.log(logMsg);
    res.status(500).send(logMsg);
  }
});

app.get("/getusers", isAdministrator, async (req, res) => {
  const users: User[] = await usersDatabase.findAllUsers();
  if (users.length === 0) {
    res.status(500).send("Error while trying to retrieve users from database.");
  }
  const filteredUsers: any = [];
  users.forEach((user: User) => {
    const userInfo = {
      username: user.username,
      isAdmin: user.isAdmin,
    };
    filteredUsers.push(userInfo);
  });
  res.status(200).send(filteredUsers);
});

app.post("/addcontact", async (req, res) => {
  if (!req.user) {
    return res.status(400).send("User not logged in");
  }

  if (!req.body) {
    return res.status(400).send("Could not add contact, request is invalid");
  }

  const { username, contact } = req.body;

  if (username === contact) {
    return res.status(400).send("Cannot add yourself as a contact");
  }

  if (!(await usersDatabase.findUser(username))) {
    return res.status(400).send("User not found, could not add contact");
  }

  if (!(await usersDatabase.findUser(contact))) {
    return res.status(400).send("Contact does not exist");
  }

  const result = await usersDatabase.addContactToUser(username, contact);

  if (result) {
    return res.status(200).send("User added to contacts");
  } else {
    return res.status(400).send("Could not add user to contacts");
  }
});

app.get("/messages/:roomNumber", async (req, res) => {
  console.log(req);
  console.log(req.user);
  if (!req.user) {
    return res.status(400).send("User not logged in");
  }

  const roomNumber = req.params.roomNumber;
  try {
    const messages = await messagesDatabase.findRoom(roomNumber);
    if (messages) {
      return res.status(200).json(messages);
    } else {
      return res
        .status(500)
        .send("Could not find any messages for that room number");
    }
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});
//-------------------- END OF ROUTES --------------------\\

//-------------------- START SERVER --------------------\\
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening to port ${process.env.SERVER_PORT}...`);
});
