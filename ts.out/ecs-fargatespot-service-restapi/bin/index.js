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
const ecs_fargatespot_service_restapi_stack_1 = require("../lib/ecs-fargatespot-service-restapi-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || config_1.DEFAULT_STAGE;
new ecs_fargatespot_service_restapi_stack_1.FargateSpotRestAPIServiceStack(app, `ecs-fargatespot-service-restapi-${stage}`, {
    env,
    stage,
    description: 'ECS Fargate service for RESTful API with Spot CapacityProvider and ALB',
    terminationProtection: stage != config_1.DEFAULT_STAGE
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3MtZmFyZ2F0ZXNwb3Qtc2VydmljZS1yZXN0YXBpL2Jpbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBQ25DLHlDQUE2QztBQUM3Qyx3R0FBOEY7QUFFOUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxHQUFHLEdBQUc7SUFDUixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7SUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3pDLENBQUM7QUFDRixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxzQkFBYSxDQUFDO0FBRS9ELElBQUksc0VBQThCLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxLQUFLLEVBQUUsRUFBRTtJQUNoRixHQUFHO0lBQ0gsS0FBSztJQUNMLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYscUJBQXFCLEVBQUUsS0FBSyxJQUFFLHNCQUFhO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgREVGQVVMVF9TVEFHRSB9IGZyb20gJy4uLy4uL2NvbmZpZyc7XHJcbmltcG9ydCB7IEZhcmdhdGVTcG90UmVzdEFQSVNlcnZpY2VTdGFjayB9IGZyb20gJy4uL2xpYi9lY3MtZmFyZ2F0ZXNwb3Qtc2VydmljZS1yZXN0YXBpLXN0YWNrJztcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcbmNvbnN0IGVudiA9IHtcclxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXHJcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTlxyXG59O1xyXG5jb25zdCBzdGFnZSA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJykgfHwgREVGQVVMVF9TVEFHRTtcclxuXHJcbm5ldyBGYXJnYXRlU3BvdFJlc3RBUElTZXJ2aWNlU3RhY2soYXBwLCBgZWNzLWZhcmdhdGVzcG90LXNlcnZpY2UtcmVzdGFwaS0ke3N0YWdlfWAsIHtcclxuICAgIGVudixcclxuICAgIHN0YWdlLFxyXG4gICAgZGVzY3JpcHRpb246ICdFQ1MgRmFyZ2F0ZSBzZXJ2aWNlIGZvciBSRVNUZnVsIEFQSSB3aXRoIFNwb3QgQ2FwYWNpdHlQcm92aWRlciBhbmQgQUxCJyxcclxuICAgIHRlcm1pbmF0aW9uUHJvdGVjdGlvbjogc3RhZ2UhPURFRkFVTFRfU1RBR0VcclxufSk7XHJcbiJdfQ==