# Node AWS Lambda RPC extension example

This is an example of how one might implement the ability for the Lambda handler to communicate with Lambda extension.
In this particular case, request / response data could be forwarded from the handler to the extension.

Extension code lives in the `layer` directory and is a modification of the [sample example provided by AWS](https://github.com/aws-samples/aws-lambda-extensions/tree/main/nodejs-example-extension).

As for the Lambda, the handler code could be found in the `functions/hello` directory.

## Deploying

1. Make sure that the extension-related files has execute permissions.

   - `chmod +x layer/extensions/index.js`
   - `chmod +x layer/node-extension`

2. Run `npm run deploy`
