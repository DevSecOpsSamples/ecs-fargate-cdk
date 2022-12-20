import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface EcsCodeDeployStackProps extends StackProps {
    stage: string;
    serviceName: string;
}
/**
 * SSM parameters:
 * /cdk-ecs-fargate/ecr-repo-arn
 * /cdk-ecs-fargate/ecr-repo-name
 * /cdk-ecs-fargate/cluster-securitygroup-id
 * /cdk-ecs-fargate/cluster-name
 * /cdk-ecs-fargate/codecommit-arn
 */
export declare class EcsCodeDeployStack extends Stack {
    constructor(scope: Construct, id: string, props: EcsCodeDeployStackProps);
}
