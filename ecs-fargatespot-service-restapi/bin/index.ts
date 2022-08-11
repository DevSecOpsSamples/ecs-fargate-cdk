#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DEFAULT_STAGE } from '../../config';
import { FargateSpotRestAPIServiceStack } from '../lib/ecs-fargatespot-service-restapi-stack';

const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
const stage = app.node.tryGetContext('stage') || DEFAULT_STAGE;

new FargateSpotRestAPIServiceStack(app, `ecs-fargatespot-service-restapi-${stage}`, {
    env,
    stage,
    description: 'ECS Fargate service for RESTful API with Spot CapacityProvider and ALB',
    terminationProtection: stage!=DEFAULT_STAGE
});
