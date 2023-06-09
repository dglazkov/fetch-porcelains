export class CompletionStreamer {
  writable;
  readable;
  controller;

  constructor() {
    this.writable = new WritableStream(this);
    this.readable = new ReadableStream(this);
  }

  start(controller) {
    this.controller = controller;
  }

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
          this.controller?.close();
          return;
        }
        const parsed = JSON.parse(content);
        this.controller?.enqueue({
          completion: parsed.choices[0].text || "",
          response: parsed,
        });
      });
  }
}

class OpenAIRequest extends Request {
  #params;

  constructor(url, init, params) {
    init.body = JSON.stringify(params);
    super(url, init);
    this.#params = params;
  }

  prompt(prompt) {
    return new OpenAIRequest(
      this.url,
      { headers: this.headers, method: this.method },
      { ...this.#params, prompt }
    );
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
    return new OpenAIRequest(url, { headers, method: "POST" }, params);
  }
}

export const openai = (apiKey) => new OpenAI(apiKey);
