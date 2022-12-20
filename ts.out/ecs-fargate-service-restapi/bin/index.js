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
const ecs_fargate_service_restapi_stack_1 = require("../lib/ecs-fargate-service-restapi-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
new ecs_fargate_service_restapi_stack_1.FargateRestAPIServiceStack(app, `ecs-fargate-service-restapi-${stage}`, {
    env,
    stage,
    description: 'ECS Fargate service for RESTful API with ALB',
    terminationProtection: stage !== config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3MtZmFyZ2F0ZS1zZXJ2aWNlLXJlc3RhcGkvYmluL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMseUNBQTZDO0FBQzdDLGdHQUFzRjtBQUV0RixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixNQUFNLEdBQUcsR0FBRztJQUNSLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7Q0FDekMsQ0FBQztBQUNGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHNCQUFhLENBQUM7QUFFL0QsSUFBSSw4REFBMEIsQ0FBQyxHQUFHLEVBQUUsK0JBQStCLEtBQUssRUFBRSxFQUFFO0lBQ3hFLEdBQUc7SUFDSCxLQUFLO0lBQ0wsV0FBVyxFQUFFLDhDQUE4QztJQUMzRCxxQkFBcUIsRUFBRSxLQUFLLEtBQUcsc0JBQWE7Q0FDL0MsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NUQUdFIH0gZnJvbSAnLi4vLi4vY29uZmlnJztcclxuaW1wb3J0IHsgRmFyZ2F0ZVJlc3RBUElTZXJ2aWNlU3RhY2sgfSBmcm9tICcuLi9saWIvZWNzLWZhcmdhdGUtc2VydmljZS1yZXN0YXBpLXN0YWNrJztcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcbmNvbnN0IGVudiA9IHtcclxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXHJcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTlxyXG59O1xyXG5jb25zdCBzdGFnZSA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJykgfHwgREVGQVVMVF9TVEFHRTtcclxuXHJcbm5ldyBGYXJnYXRlUmVzdEFQSVNlcnZpY2VTdGFjayhhcHAsIGBlY3MtZmFyZ2F0ZS1zZXJ2aWNlLXJlc3RhcGktJHtzdGFnZX1gLCB7XHJcbiAgICBlbnYsXHJcbiAgICBzdGFnZSxcclxuICAgIGRlc2NyaXB0aW9uOiAnRUNTIEZhcmdhdGUgc2VydmljZSBmb3IgUkVTVGZ1bCBBUEkgd2l0aCBBTEInLFxyXG4gICAgdGVybWluYXRpb25Qcm90ZWN0aW9uOiBzdGFnZSE9PURFRkFVTFRfU1RBR0VcclxufSk7XHJcbiJdfQ==