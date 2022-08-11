import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, CfnOutput, Tags } from 'aws-cdk-lib';
import * as path from 'path';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecrdeploy from 'cdk-ecr-deployment';

import { SSM_PREFIX } from '../../config';
import { StackCommonProps } from '../../config';

export interface EcrStackProps extends StackCommonProps {
    serviceName: string;
}
/**
 * Build 'app/Dockerfile' and push to ECR for X86 and ARM
 */
export class EcrCodeCommitStack extends Stack {
    constructor(scope: Construct, id: string, props: EcrStackProps) {
        super(scope, id, props);

        const stage = props.stage;
        const serviceName = props.serviceName;

        const assetX86 = new assets.DockerImageAsset(this, 'ecr-image-x86', {
            directory: path.join(__dirname, "../../", "app")
        });
        const ecrRepo = new ecr.Repository(this, `${serviceName}`, {
            repositoryName: `${serviceName}`
        });
        new ecrdeploy.ECRDeployment(this, 'ecr-deploy-x86', {
            src: new ecrdeploy.DockerImageName(assetX86.imageUri),
            dest: new ecrdeploy.DockerImageName(`${ecrRepo.repositoryUriForTag('latest')}`),
        });

        const assetArm = new assets.DockerImageAsset(this, 'ecr-image-arm', {
            directory: path.join(__dirname, "../../", "app"),
            platform: assets.Platform.LINUX_ARM64,
        });
        const ecrArmRepo = new ecr.Repository(this, `${serviceName}-arm`, {
            repositoryName: `${serviceName}-arm`
        });
        new ecrdeploy.ECRDeployment(this, 'ecr-deploy-arm', {
            src: new ecrdeploy.DockerImageName(assetArm.imageUri),
            dest: new ecrdeploy.DockerImageName(`${ecrArmRepo.repositoryUriForTag('latest')}`),
        });

        const codecommitRepo = new codecommit.Repository(this, `${serviceName}-codecommit`, {
            repositoryName: `${serviceName}`
        });

        Tags.of(codecommitRepo).add('Stage', stage);
        Tags.of(ecrRepo).add('Stage', stage);
        Tags.of(ecrArmRepo).add('Stage', stage);

        new CfnOutput(this, 'URI', { value: ecrRepo.repositoryUri });
        new CfnOutput(this, 'URIARM', { value: ecrArmRepo.repositoryUri });

        new ssm.StringParameter(this, 'ssm-codecommit-arn', { parameterName: `${SSM_PREFIX}/codecommit-arn`, stringValue: codecommitRepo.repositoryArn });

        new ssm.StringParameter(this, 'ssm-ecr-repo-name', { parameterName: `${SSM_PREFIX}/ecr-repo-name`, stringValue: ecrRepo.repositoryName });
        new ssm.StringParameter(this, 'ssm-ecr-repo-arn', { parameterName: `${SSM_PREFIX}/ecr-repo-arn`, stringValue: ecrRepo.repositoryArn });
        new ssm.StringParameter(this, 'ssm-ecr-armrepo-name', { parameterName: `${SSM_PREFIX}/ecr-armrepo-name`, stringValue: ecrArmRepo.repositoryUri });
        new ssm.StringParameter(this, 'ssm-ecr-armrepo-arn', { parameterName: `${SSM_PREFIX}/ecr-armrepo-arn`, stringValue: ecrArmRepo.repositoryArn });

        new CfnOutput(this, 'CodeCommitRepoUrl', { value: codecommitRepo.repositoryCloneUrlHttp });
    }
}
