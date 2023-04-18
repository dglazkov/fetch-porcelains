// Examples for https://glazkov.com/2023/04/17/porcelains/

{
  // my API which wraps over the underlying layer.
  const callMyCoolService = async (payload) => {
    const myCoolServiceUrl = "example.com/mycoolservice";
    return await // the underlying layer that I wrap: `fetch`
    (
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ).json();
  };
  // ...
  // at the consuming call site:
  const result = await callMyCoolService({ foo: "bar" });
  console.log(result);
}

{
  // my API which only supplies a well-formatted Request.
  const myCoolServiceRequest = (payload) =>
    Request("example.com/mycoolservice", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  // ...
  // at the consuming call site:
  const result = await (
    await fetch(myCoolServiceRequest({ foo: "bar" }))
  ).json();
  console.log(result);
}

{
  // Same porcelain as above.
  const myCoolServiceRequest = (payload) =>
    Request("example.com/mycoolservice", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  // New streaming porcelain.
  class MyServiceStreamer {
    writable;
    readable;
    // TODO: Implement this porcelain.
  }
  // ...
  // at the consuming call site:
  const result = await fetch(
    myCoolServiceRequest({ foo: "bar", streaming: true })
  ).body.pipeThrough(new MyServiceStreamer());

  for await (const chunk of result) {
    process.stdout.write(chunk);
  }
  process.stdout.write("\n");
}
