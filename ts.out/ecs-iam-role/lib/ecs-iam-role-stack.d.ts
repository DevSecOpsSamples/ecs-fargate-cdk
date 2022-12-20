import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
/**
 * This stack is written to share IAM role among multiple-cluster
 *
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html
 *
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
 *
 */
export declare class EcsIamRoleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps);
}
