import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { StackCommonProps } from '../../config';
export interface EcrStackProps extends StackCommonProps {
    serviceName: string;
}
/**
 * Build 'app/Dockerfile' and push to ECR for X86 and ARM
 */
export declare class EcrCodeCommitStack extends Stack {
    constructor(scope: Construct, id: string, props: EcrStackProps);
}
