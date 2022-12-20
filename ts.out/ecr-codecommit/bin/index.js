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
const ecr_codecommit_stack_1 = require("../lib/ecr-codecommit-stack");
const config_1 = require("../../config");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
const serviceName = `fargate-restapi-${stage}`;
new ecr_codecommit_stack_1.EcrCodeCommitStack(app, `ecr-${serviceName}`, {
    env,
    stage,
    serviceName,
    description: `ECR: ${serviceName}`,
    terminationProtection: stage !== config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3ItY29kZWNvbW1pdC9iaW4vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUNuQyxzRUFBaUU7QUFDakUseUNBQTZDO0FBRTdDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLE1BQU0sR0FBRyxHQUFHO0lBQ1IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO0lBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtDQUN6QyxDQUFDO0FBQ0YsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksc0JBQWEsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxtQkFBbUIsS0FBSyxFQUFFLENBQUE7QUFFOUMsSUFBSSx5Q0FBa0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxXQUFXLEVBQUUsRUFBRTtJQUM5QyxHQUFHO0lBQ0gsS0FBSztJQUNMLFdBQVc7SUFDWCxXQUFXLEVBQUUsUUFBUSxXQUFXLEVBQUU7SUFDbEMscUJBQXFCLEVBQUUsS0FBSyxLQUFHLHNCQUFhO0NBQy9DLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgRWNyQ29kZUNvbW1pdFN0YWNrIH0gZnJvbSAnLi4vbGliL2Vjci1jb2RlY29tbWl0LXN0YWNrJztcclxuaW1wb3J0IHsgREVGQVVMVF9TVEFHRSB9IGZyb20gJy4uLy4uL2NvbmZpZyc7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5jb25zdCBlbnYgPSB7XHJcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxyXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT05cclxufTtcclxuY29uc3Qgc3RhZ2UgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCdzdGFnZScpIHx8IERFRkFVTFRfU1RBR0U7XHJcbmNvbnN0IHNlcnZpY2VOYW1lID0gYGZhcmdhdGUtcmVzdGFwaS0ke3N0YWdlfWBcclxuXHJcbm5ldyBFY3JDb2RlQ29tbWl0U3RhY2soYXBwLCBgZWNyLSR7c2VydmljZU5hbWV9YCwge1xyXG4gICAgZW52LFxyXG4gICAgc3RhZ2UsXHJcbiAgICBzZXJ2aWNlTmFtZSxcclxuICAgIGRlc2NyaXB0aW9uOiBgRUNSOiAke3NlcnZpY2VOYW1lfWAsXHJcbiAgICB0ZXJtaW5hdGlvblByb3RlY3Rpb246IHN0YWdlIT09REVGQVVMVF9TVEFHRVxyXG59KTtcclxuIl19