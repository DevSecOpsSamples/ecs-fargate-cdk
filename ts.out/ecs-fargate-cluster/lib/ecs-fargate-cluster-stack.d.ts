import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackCommonProps } from '../../config';
/**
 * Create ECS Fargate cluster and shared security group for ALB ingress
 */
export declare class EcsFargateClusterStack extends Stack {
    constructor(scope: Construct, id: string, props: StackCommonProps);
}
