#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DEFAULT_STAGE } from '../../config';
import { EcsCodeDeployStack } from '../lib/ecs-codedeploy-stack';

const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};
const stage = app.node.tryGetContext('stage') || DEFAULT_STAGE;

const serviceName = 'fargate-restapi';

new EcsCodeDeployStack(app, `codepipeline-${serviceName}-${stage}`, {
    env,
    stage,
    serviceName,
    description: `Code Pipeline, service name: ${serviceName}-${stage}`,
    terminationProtection: stage!==DEFAULT_STAGE
});
