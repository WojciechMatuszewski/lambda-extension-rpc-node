import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigwIntegrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import { getFunctionPath, pathFromRoot } from "./utils/utils";

export class NodeExtensionsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloFunction = new lambda.Function(this, "helloFunction", {
      code: lambda.Code.fromAsset(getFunctionPath("hello")),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handler.handler"
    });

    const extensionLayer = new lambda.LayerVersion(this, "nodeExtensionLayer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      code: lambda.Code.fromAsset(pathFromRoot("layer"))
    });

    helloFunction.addLayers(extensionLayer);

    const api = new apigwv2.HttpApi(this, "helloApi");

    api.addRoutes({
      integration: new apigwIntegrations.LambdaProxyIntegration({
        handler: helloFunction
      }),
      path: "/",
      methods: [apigwv2.HttpMethod.GET]
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: api.apiEndpoint
    });

    /**
     * You can tail logs using sam-cli
     *
     * sam logs -n WHATEVER_THE_FUNCTION_NAME_IS -t
     */
    new cdk.CfnOutput(this, "helloFunctionName", {
      value: helloFunction.functionName
    });
  }
}
