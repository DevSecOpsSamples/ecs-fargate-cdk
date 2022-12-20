import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { StackCommonProps } from '../../config';
/**
 * Crearte Fargate Service, Auto Scaling, ALB, and Log Group.
 * Set the ALB options for the production-level.
 */
export declare class FargateRestAPIServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: StackCommonProps);
}
