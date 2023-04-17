import { config } from "dotenv";
import { completion, openai } from "./porcelains.js";

config();

const response = await fetch(
  openai(process.env.OPENAI_API_KEY).completion({
    model: "text-davinci-003",
    prompt: "Give me some lyrics, make it up.",
    max_tokens: 256,
    temperature: 0,
  })
);
console.log(await completion.simple(response));

const stream = await fetch(
  openai(process.env.OPENAI_API_KEY).completion({
    model: "text-davinci-003",
    prompt: "Give me some lyrics, make it up.",
    max_tokens: 256,
    temperature: 0,
    stream: true,
  })
);
const streamedLyrics = await completion.stream(stream);
for await (const chunk of streamedLyrics) {
  process.stdout.write(chunk.completion);
}
process.stdout.write("\n");
