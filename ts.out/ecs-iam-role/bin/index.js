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
const ecs_iam_role_stack_1 = require("../lib/ecs-iam-role-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
new ecs_iam_role_stack_1.EcsIamRoleStack(app, `ecs-fargate-iam-role-${stage}`, {
    env,
    description: 'ECS Fargate IAM Role',
    terminationProtection: stage !== config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3MtaWFtLXJvbGUvYmluL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMseUNBQTZDO0FBQzdDLGtFQUE0RDtBQUU1RCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixNQUFNLEdBQUcsR0FBRztJQUNSLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7Q0FDekMsQ0FBQztBQUNGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHNCQUFhLENBQUM7QUFFL0QsSUFBSSxvQ0FBZSxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsS0FBSyxFQUFFLEVBQUc7SUFDdkQsR0FBRztJQUNILFdBQVcsRUFBRSxzQkFBc0I7SUFDbkMscUJBQXFCLEVBQUUsS0FBSyxLQUFHLHNCQUFhO0NBQy9DLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgREVGQVVMVF9TVEFHRSB9IGZyb20gJy4uLy4uL2NvbmZpZyc7XHJcbmltcG9ydCB7IEVjc0lhbVJvbGVTdGFjayB9IGZyb20gJy4uL2xpYi9lY3MtaWFtLXJvbGUtc3RhY2snO1xyXG5cclxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcclxuY29uc3QgZW52ID0ge1xyXG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcclxuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OXHJcbn07XHJcbmNvbnN0IHN0YWdlID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgnc3RhZ2UnKSB8fCBERUZBVUxUX1NUQUdFO1xyXG5cclxubmV3IEVjc0lhbVJvbGVTdGFjayhhcHAsIGBlY3MtZmFyZ2F0ZS1pYW0tcm9sZS0ke3N0YWdlfWAsICB7XHJcbiAgICBlbnYsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0VDUyBGYXJnYXRlIElBTSBSb2xlJyxcclxuICAgIHRlcm1pbmF0aW9uUHJvdGVjdGlvbjogc3RhZ2UhPT1ERUZBVUxUX1NUQUdFXHJcbn0pOyJdfQ==