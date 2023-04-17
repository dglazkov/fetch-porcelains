class OpenAIStreamParser {
  onchunk;
  onend;

  write(chunk) {
    const decoder = new TextDecoder();
    const s = decoder.decode(chunk);
    s.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const pos = line.indexOf(":");
        const name = line.substring(0, pos);
        if (name !== "data") return;
        const content = line.substring(pos + 1).trim();
        if (content.length == 0) return;
        if (content === "[DONE]") {
          this.onend?.();
          return;
        }
        const parsed = JSON.parse(content);
        this.onchunk?.({
          completion: parsed.choices[0].text || "",
          response: parsed,
        });
      });
  }
}

class StreamCompletionChunker {
  writable;
  readable;

  constructor() {
    const parser = new OpenAIStreamParser();
    this.writable = new WritableStream(parser);
    this.readable = new ReadableStream({
      start(controller) {
        parser.onchunk = (chunk) => controller.enqueue(chunk);
        parser.onend = () => controller.close();
      },
    });
  }
}

class OpenAI {
  apiKey;

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  completion(params) {
    const url = "https://api.openai.com/v1/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    const body = JSON.stringify(params);
    return new Request(url, { headers, body, method: "POST" });
  }
}

export const openai = (apiKey) => new OpenAI(apiKey);

export const completion = {
  async simple(response) {
    const data = await response.json();
    return data.choices[0].text;
  },
  async stream(response) {
    return response.body.pipeThrough(new StreamCompletionChunker());
  },
};
