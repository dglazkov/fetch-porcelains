import { config } from "dotenv";
import { openai, CompletionStreamChunker } from "./porcelains.js";

config();

{
  // Simple completion.
  const response = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      model: "text-davinci-003",
      prompt: "How do porcelains relate to plumbing?",
      max_tokens: 256,
      temperature: 0,
    })
  );
  const completion = await response.json();
  console.log(completion.choices[0].text);
}

{
  // Memoizing configuration for multiple uses.
  const davinci = openai(process.env.OPENAI_API_KEY).completion({
    model: "text-davinci-003",
    max_tokens: 256,
    temperature: 0,
  });
  const response = await fetch(
    davinci.prompt("Say something funny about porcelains.")
  );
  const completion = await response.json();
  console.log(completion.choices[0].text);
}

{
  // Streaming completion.
  const stream = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      model: "text-davinci-003",
      prompt: "Give me some lyrics about porcelains.",
      max_tokens: 256,
      temperature: 0,
      stream: true,
    })
  );
  const response = stream.body.pipeThrough(new CompletionStreamChunker());
  for await (const chunk of response) {
    process.stdout.write(chunk.completion);
  }
  process.stdout.write("\n");
}
