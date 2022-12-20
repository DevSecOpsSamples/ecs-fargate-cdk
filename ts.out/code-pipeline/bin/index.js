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
const ecs_codedeploy_stack_1 = require("../lib/ecs-codedeploy-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
const serviceName = 'fargate-restapi';
new ecs_codedeploy_stack_1.EcsCodeDeployStack(app, `codepipeline-${serviceName}-${stage}`, {
    env,
    stage,
    serviceName,
    description: `Code Pipeline, service name: ${serviceName}-${stage}`,
    terminationProtection: stage !== config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb2RlLXBpcGVsaW5lL2Jpbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBQ25DLHlDQUE2QztBQUM3QyxzRUFBaUU7QUFFakUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxHQUFHLEdBQUc7SUFDUixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7SUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3pDLENBQUM7QUFDRixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxzQkFBYSxDQUFDO0FBRS9ELE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDO0FBRXRDLElBQUkseUNBQWtCLENBQUMsR0FBRyxFQUFFLGdCQUFnQixXQUFXLElBQUksS0FBSyxFQUFFLEVBQUU7SUFDaEUsR0FBRztJQUNILEtBQUs7SUFDTCxXQUFXO0lBQ1gsV0FBVyxFQUFFLGdDQUFnQyxXQUFXLElBQUksS0FBSyxFQUFFO0lBQ25FLHFCQUFxQixFQUFFLEtBQUssS0FBRyxzQkFBYTtDQUMvQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgREVGQVVMVF9TVEFHRSB9IGZyb20gJy4uLy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBFY3NDb2RlRGVwbG95U3RhY2sgfSBmcm9tICcuLi9saWIvZWNzLWNvZGVkZXBsb3ktc3RhY2snO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuY29uc3QgZW52ID0ge1xuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04sXG59O1xuY29uc3Qgc3RhZ2UgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCdzdGFnZScpIHx8IERFRkFVTFRfU1RBR0U7XG5cbmNvbnN0IHNlcnZpY2VOYW1lID0gJ2ZhcmdhdGUtcmVzdGFwaSc7XG5cbm5ldyBFY3NDb2RlRGVwbG95U3RhY2soYXBwLCBgY29kZXBpcGVsaW5lLSR7c2VydmljZU5hbWV9LSR7c3RhZ2V9YCwge1xuICAgIGVudixcbiAgICBzdGFnZSxcbiAgICBzZXJ2aWNlTmFtZSxcbiAgICBkZXNjcmlwdGlvbjogYENvZGUgUGlwZWxpbmUsIHNlcnZpY2UgbmFtZTogJHtzZXJ2aWNlTmFtZX0tJHtzdGFnZX1gLFxuICAgIHRlcm1pbmF0aW9uUHJvdGVjdGlvbjogc3RhZ2UhPT1ERUZBVUxUX1NUQUdFXG59KTtcbiJdfQ==