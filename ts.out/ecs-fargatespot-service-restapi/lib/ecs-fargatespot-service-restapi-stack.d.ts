import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { StackCommonProps } from '../../config';
/**
 * Crearte Fargate Service with Spot CapacityProvider, Auto Scaling, ALB, and Log Group.
 * Set the ALB logs for the production-level.
 */
export declare class FargateSpotRestAPIServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: StackCommonProps);
}
