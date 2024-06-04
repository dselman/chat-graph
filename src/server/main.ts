import express from "express";
import ViteExpress from "vite-express";
import { ConsoleLogger, Conversation, GraphModel, GraphModelOptions, Logger, getOpenAiEmbedding } from '@accordproject/concerto-graph';
import session from "express-session";
import { LogMessage, MemoryLogger } from "./MemoryLogger.js";

function checkEnv(name: string) {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} has not been set`);
  }
}

checkEnv('NEO4J_PASS');
checkEnv('NEO4J_URL');

const options: GraphModelOptions = {
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASS: process.env.NEO4J_PASS,
  NEO4J_URL: process.env.NEO4J_URL,
  logger: MemoryLogger,
  logQueries: false,
  embeddingFunction: process.env.OPENAI_API_KEY ? getOpenAiEmbedding : undefined
}
const graphModel = new GraphModel(undefined, options);
await graphModel.connect();
await graphModel.loadConcertoModels();
await graphModel.dropIndexes();
await graphModel.createIndexes();

const app = express();
app.use(express.json());

function jsonParse(obj:any) {
  try {
    return JSON.parse(obj);
  }
  catch(err) {
    return obj;
  }
}

function replaceContent(obj:any) {
  if(obj) {
    return JSON.parse(JSON.stringify(obj, (k,v) => (k === 'content' && v) 
      ? JSON.stringify(removeEmbedding(jsonParse(v))) : v))
  }
  else {
    return obj;
  }
}

function removeEmbedding(obj:any) {
  if(obj) {
    return JSON.parse(JSON.stringify(obj, (k,v) => (k === 'embedding') ? undefined : v))
  }
  else {
    return obj;
  }
}

app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // one day
      expires: new Date(2025,1,1),
      secure: false
    },
    // store,
    secret: "1baddeed",
    resave: true,
    saveUninitialized: false,
  })
)

type Messages = {
  items: Array<any>;
};

// Augment express-session with a custom SessionData object
declare module "express-session" {
  interface SessionData {
    messages: Messages;
  }
}

app.get('/api/messages', async (req, res) => {
  res.status(200).send({messages: replaceContent(req.session.messages?.items)});
});

app.post('/api/reset', async (req, res) => {
  req.session.destroy( () => {
    res.status(200).send({messages: []});
  });
});


app.get('/api/questions', async (req, res) => {
  res.status(200).send({questions: graphModel.getQuestions()});
});

app.get('/api/description', async (req, res) => {
  res.status(200).send({description: graphModel.getDescription()});
});

app.post("/api/chat", async (req, res) => {
  try {
    if(!req.body.message) {
      res.status(400).send('Invalid message');
      return;
    }
    const memoryLogger = MemoryLogger;
    const convoOptions = {
      toolOptions: {
        getById: true,
        chatWithData: true,
        fullTextSearch: true,
        similaritySearch: true
      },
      maxContextSize: 64000,
      logger: memoryLogger
    };
    (memoryLogger as any).clear();
    const conversation = new Conversation(graphModel, convoOptions);
    const messages = req.session.messages?.items ? req.session.messages.items : [conversation.getSystemMessage()];
    const newMessages = await conversation.runMessages(messages, req.body.message);
    req.session.messages = {items: newMessages};
    if(newMessages.length > 0) {
      const cypherMessages = (memoryLogger as any).getLogMessages()
      .filter( (m:LogMessage) => m.level === 'info' 
        && m.message.toString().startsWith('Generated Cypher')
        /*&& m.message.toString().indexOf('<EMBEDDINGS>') > 0*/ );
      newMessages[newMessages.length-1].logMessages = cypherMessages;
    }
    const replaced = replaceContent(newMessages);
    res.status(200).send({messages: replaced});
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.use(function (err: any, req: any, res: any, next: any) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on ${port}...`)
);
