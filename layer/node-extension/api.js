import fetch from "node-fetch";
import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";

const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension`;

const extensionName = basename(dirname(fileURLToPath(import.meta.url)));

export async function register() {
  const res = await fetch(`${baseUrl}/register`, {
    method: "post",
    body: JSON.stringify({
      events: ["INVOKE", "SHUTDOWN"]
    }),
    headers: {
      "Content-Type": "application/json",
      "Lambda-Extension-Name": extensionName
    }
  });

  if (!res.ok) {
    console.error("register failed", await res.text());
  }

  return res.headers.get("lambda-extension-identifier");
}

export async function next(extensionId) {
  const res = await fetch(`${baseUrl}/event/next`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "Lambda-Extension-Identifier": extensionId
    }
  });

  if (!res.ok) {
    console.error("next failed", await res.text());
    return null;
  }

  return await res.json();
}

/**
 * Subscribe creates a server which will be used as a bridge between the extension and the Lambda wrapper.
 *
 * The Lambda wrapper will be sending http requests to this server.
 * The requests will contain request / response data of the handler.
 */
export function subscribe(subscriber) {
  const server = http.createServer((req, res) => {
    console.log(`incoming ${req.method} request`);

    if (req.method != "POST") {
      res.writeHead(200, {});
      res.end();
    } else {
      const body = [];
      req.on("data", data => {
        body.push(data);
      });

      req.on("end", () => {
        const rawReqPayload = Buffer.concat(body).toString();
        subscriber(JSON.parse(rawReqPayload));

        res.writeHead(200);
        res.end();
      });
    }
  });

  server.listen(8999, "localhost", () => {
    console.info(
      `Extension server listening on ${server.address().address}:${
        server.address().port
      }`
    );
  });

  return () => {
    return new Promise(resolve => {
      server.close(err => {
        if (err) {
          console.error("Extension server closing error", err);
        }

        console.log("Closing extension server");
        resolve();
      });
    });
  };
}
