import { config } from "dotenv";
import { completion, openai } from "./porcelains.js";

config();

{
  // Simple completion.
  const response = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      model: "text-davinci-003",
      prompt: "Give me some lyrics, make it up.",
      max_tokens: 256,
      temperature: 0,
    })
  );
  console.log(await completion.simple(response));
}

{
  // Memoizing configuration for multiple uses.
  const davinci = openai(process.env.OPENAI_API_KEY).completion({
    model: "text-davinci-003",
    max_tokens: 256,
    temperature: 0,
  });
  const response = await fetch(davinci.prompt("Say something funny."));
  console.log(await completion.simple(response));
}

{
  // Streaming completion.
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
}
