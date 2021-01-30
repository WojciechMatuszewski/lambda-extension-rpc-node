import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import { NodeExtensionsStack } from "../lib/node-extensions-stack";

const app = new cdk.App();
new NodeExtensionsStack(app, "NodeExtensions");
