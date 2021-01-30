#!/usr/bin/env node
import { register, next, subscribe } from "./api.js";
import EventEmitter from "events";

const EventType = {
  INVOKE: "INVOKE",
  SHUTDOWN: "SHUTDOWN"
};

(async function main() {
  process.on("SIGINT", async () => await handleShutdown("SIGINT"));
  process.on("SIGTERM", async () => await handleShutdown("SIGTERM"));

  const extensionId = await register();
  console.log("extensionId", extensionId);

  const emitter = new EventEmitter();
  const cleanup = subscribe(data => emitter.emit("data", data));

  async function handleShutdown(event) {
    console.log("shutdown", { event });
    await cleanup();
    process.exit(0);
  }

  async function* dataEvents() {
    async function waitForDataEvent() {
      return new Promise(resolve => {
        emitter.once("data", resolve);
      });
    }

    while (true) {
      const dataEvent = await waitForDataEvent();
      yield dataEvent;
    }
  }

  async function processEvents() {
    const eventsStream = dataEvents();
    for await (let dataEvent of eventsStream) {
      console.log({ dataEvent });
      if (dataEvent.type == "onResponse") {
        break;
      }
    }
  }

  while (true) {
    const event = await next(extensionId);
    switch (event.eventType) {
      case EventType.SHUTDOWN:
        await handleShutdown(event);
        break;
      case EventType.INVOKE:
        await processEvents();
        break;
      default:
        throw new Error("unknown event: " + event.eventType);
    }
  }
})();
