#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = __importStar(require("aws-cdk-lib"));
const config_1 = require("../../config");
const cluster_config_1 = require("../lib/cluster-config");
const ecs_fargate_cluster_stack_1 = require("../lib/ecs-fargate-cluster-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
new ecs_fargate_cluster_stack_1.EcsFargateClusterStack(app, `ecs-fargate-cluster-${cluster_config_1.CLUSTER_NAME}-${stage}`, {
    env,
    stage,
    description: `ECS Fargate cluster, cluster name: ${cluster_config_1.CLUSTER_NAME}-${stage}`,
    terminationProtection: stage !== config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3MtZmFyZ2F0ZS1jbHVzdGVyL2Jpbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBRW5DLHlDQUE2QztBQUM3QywwREFBcUQ7QUFDckQsZ0ZBQTBFO0FBRTFFLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLE1BQU0sR0FBRyxHQUFHO0lBQ1IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO0lBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtDQUN6QyxDQUFDO0FBQ0YsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksc0JBQWEsQ0FBQztBQUUvRCxJQUFJLGtEQUFzQixDQUFDLEdBQUcsRUFBRSx1QkFBdUIsNkJBQVksSUFBSSxLQUFLLEVBQUUsRUFBRTtJQUM1RSxHQUFHO0lBQ0gsS0FBSztJQUNMLFdBQVcsRUFBRSxzQ0FBc0MsNkJBQVksSUFBSSxLQUFLLEVBQUU7SUFDMUUscUJBQXFCLEVBQUUsS0FBSyxLQUFHLHNCQUFhO0NBQy9DLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5cbmltcG9ydCB7IERFRkFVTFRfU1RBR0UgfSBmcm9tICcuLi8uLi9jb25maWcnO1xuaW1wb3J0IHsgQ0xVU1RFUl9OQU1FIH0gZnJvbSAnLi4vbGliL2NsdXN0ZXItY29uZmlnJztcbmltcG9ydCB7IEVjc0ZhcmdhdGVDbHVzdGVyU3RhY2sgfSBmcm9tICcuLi9saWIvZWNzLWZhcmdhdGUtY2x1c3Rlci1zdGFjayc7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5jb25zdCBlbnYgPSB7XG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTixcbn07XG5jb25zdCBzdGFnZSA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJykgfHwgREVGQVVMVF9TVEFHRTtcblxubmV3IEVjc0ZhcmdhdGVDbHVzdGVyU3RhY2soYXBwLCBgZWNzLWZhcmdhdGUtY2x1c3Rlci0ke0NMVVNURVJfTkFNRX0tJHtzdGFnZX1gLCB7XG4gICAgZW52LFxuICAgIHN0YWdlLFxuICAgIGRlc2NyaXB0aW9uOiBgRUNTIEZhcmdhdGUgY2x1c3RlciwgY2x1c3RlciBuYW1lOiAke0NMVVNURVJfTkFNRX0tJHtzdGFnZX1gLFxuICAgIHRlcm1pbmF0aW9uUHJvdGVjdGlvbjogc3RhZ2UhPT1ERUZBVUxUX1NUQUdFXG59KTtcbiJdfQ==