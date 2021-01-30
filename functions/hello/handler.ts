import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";
import fetch from "node-fetch";

const _handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    statusCode: 200,
    body: "Works"
  };
};

/**
 * Notify the server which is listening on the extension side that something has happened.
 *
 * When the "onResponse" event is sent, the extension stops listening to events since the invocation is considered "finished".
 *
 * You can this of this call as RPC communication.
 */
async function notifyExtension(type: "onRequest" | "onResponse", payload: any) {
  await fetch("http://127.0.0.1:8999", {
    method: "post",
    body: JSON.stringify({
      type: type,
      payload: payload
    })
  });
}

const wrapper = (
  handler: APIGatewayProxyHandlerV2
): APIGatewayProxyHandlerV2 => {
  return async (event, ctx, callback) => {
    console.log("Handler request");
    await notifyExtension("onRequest", "onRequest");

    const response = await handler(event, ctx, callback);
    console.log("Handler response");

    await notifyExtension("onResponse", response);

    return response as APIGatewayProxyResultV2;
  };
};

const handler = wrapper(_handler);
export { handler };
