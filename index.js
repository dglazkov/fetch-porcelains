import { config } from "dotenv";

config();

const completion = {
  req(apiKey, params) {
    const url = "https://api.openai.com/v1/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    const body = JSON.stringify(params);
    return [url, { headers, body, method: "POST" }];
  },
  async res(response) {
    const data = await response.json();
    return data.choices[0].text;
  },
};

const response = await fetch(
  ...completion.req(process.env.OPENAI_API_KEY, {
    model: "text-davinci-003",
    prompt: "Give me some lyrics, make it up.",
    max_tokens: 256,
    temperature: 0,
  })
);
const lyrics = await completion.res(response);

console.log(lyrics);
