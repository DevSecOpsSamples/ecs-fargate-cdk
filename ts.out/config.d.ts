import * as cdk from 'aws-cdk-lib';
/**
 * /cdk-ecs-fargate/vpc-id
 *
 * ecs-fargate-cluster:
 *   /cdk-ecs-fargate/cluster-capacityprovider-name
 *   /cdk-ecs-fargate/cluster-securitygroup-id
 *
 * iam-role:
 *   /cdk-ecs-fargate/task-execution-role-arn
 *   /cdk-ecs-fargate/default-task-role-arn
 *
 */
export declare const SSM_PREFIX = "/cdk-ecs-fargate";
export declare const DEFAULT_STAGE = "dev";
export interface StackCommonProps extends cdk.StackProps {
    stage: string;
}
