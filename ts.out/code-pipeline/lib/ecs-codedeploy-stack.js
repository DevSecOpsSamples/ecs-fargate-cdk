"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcsCodeDeployStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const cdk = __importStar(require("aws-cdk-lib"));
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const ecr = __importStar(require("aws-cdk-lib/aws-ecr"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const codebuild = __importStar(require("aws-cdk-lib/aws-codebuild"));
const codepipeline = __importStar(require("aws-cdk-lib/aws-codepipeline"));
const codecommit = __importStar(require("aws-cdk-lib/aws-codecommit"));
const codepipeline_actions = __importStar(require("aws-cdk-lib/aws-codepipeline-actions"));
const cluster_config_1 = require("../../ecs-fargate-cluster/lib/cluster-config");
const config_1 = require("../../config");
/**
 * SSM parameters:
 * /cdk-ecs-fargate/ecr-repo-arn
 * /cdk-ecs-fargate/ecr-repo-name
 * /cdk-ecs-fargate/cluster-securitygroup-id
 * /cdk-ecs-fargate/cluster-name
 * /cdk-ecs-fargate/codecommit-arn
 */
class EcsCodeDeployStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id, props);
        const ecrRepo = ecr.Repository.fromRepositoryAttributes(this, 'ecr-repo', {
            repositoryArn: cdk.Lazy.string({ produce: () => ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/ecr-repo-arn`) }),
            repositoryName: ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/ecr-repo-name`)
        });
        const vpcId = this.node.tryGetContext('vpcId') || ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/vpc-id`);
        const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcId });
        const clusterSgId = ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/cluster-securitygroup-id`);
        const ecsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ecs-security-group', clusterSgId);
        const cluster = ecs.Cluster.fromClusterAttributes(this, 'ecs-fargate-cluster', {
            clusterName: `${cluster_config_1.CLUSTER_NAME}-${props.stage}`,
            vpc,
            securityGroups: [ecsSecurityGroup]
        });
        const service = ecs.FargateService.fromFargateServiceAttributes(this, 'fargate-cluster', {
            cluster,
            serviceName: cdk.Lazy.string({ produce: () => ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/cluster-name`) })
        });
        const serviceName = props.serviceName;
        const repository = codecommit.Repository.fromRepositoryArn(this, `${serviceName}-codecommit-arn`, cdk.Lazy.string({ produce: () => ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/codecommit-arn`) }));
        /**
         * buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
         * buildImage: codebuild.LinuxBuildImage.fromDockerRegistry('public.ecr.aws/h1a5s9h8/alpine:latest')
         */
        const project = new codebuild.Project(this, `cb-project-${serviceName}`, {
            projectName: `${serviceName}-build`,
            source: codebuild.Source.codeCommit({ repository }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
                privileged: true
            },
            buildSpec: codebuild.BuildSpec.fromSourceFilename('./buildspec.yaml'),
            badge: true,
            environmentVariables: {
                'ACCOUNT_ID': {
                    value: (_a = props === null || props === void 0 ? void 0 : props.env) === null || _a === void 0 ? void 0 : _a.account
                },
                'CLUSTER_NAME': {
                    value: `${service.cluster.clusterName}`
                },
                'SERVICE_NAME': {
                    value: `${service.serviceName}`
                },
                'ECR_REPO_URI': {
                    value: `${ecrRepo.repositoryUri}`
                }
            }
        });
        ecrRepo.grantPullPush(project.role);
        (_b = project.role) === null || _b === void 0 ? void 0 : _b.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPowerUser'));
        const sourceOutput = new codepipeline.Artifact();
        const buildOutput = new codepipeline.Artifact();
        /**
         * aws secretsmanager create-secret --name '/github/token' --secret-string {your-token}
         * or set the token with oauthToken: cdk.SecretValue.plainText('<plain-text>'),
         */
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: 'engel80',
            repo: 'fargate-restapi-local',
            branch: 'master',
            oauthToken: cdk.SecretValue.secretsManager("/github/token"),
            output: sourceOutput
        });
        const buildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'CodeBuild',
            project,
            input: sourceOutput,
            outputs: [buildOutput],
        });
        const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
            actionName: 'Approve',
        });
        const deployAction = new codepipeline_actions.EcsDeployAction({
            actionName: 'DeployAction',
            service: service,
            imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`)
        });
        new codepipeline.Pipeline(this, 'ecs-deploy-pipeline', {
            pipelineName: `ecs-deploy-${service.serviceName}`,
            stages: [
                {
                    stageName: 'Source',
                    actions: [sourceAction],
                },
                {
                    stageName: 'Build',
                    actions: [buildAction],
                },
                {
                    stageName: 'Approve',
                    actions: [manualApprovalAction],
                },
                {
                    stageName: 'Deploy',
                    actions: [deployAction],
                }
            ]
        });
    }
}
exports.EcsCodeDeployStack = EcsCodeDeployStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWNvZGVkZXBsb3ktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb2RlLXBpcGVsaW5lL2xpYi9lY3MtY29kZWRlcGxveS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQWdEO0FBQ2hELGlEQUFtQztBQUNuQyx5REFBMkM7QUFFM0MseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyx5REFBMkM7QUFDM0MseURBQTJDO0FBQzNDLHFFQUF1RDtBQUN2RCwyRUFBNkQ7QUFDN0QsdUVBQXlEO0FBQ3pELDJGQUE2RTtBQUk3RSxpRkFBNEU7QUFDNUUseUNBQTBDO0FBTzFDOzs7Ozs7O0dBT0c7QUFDSCxNQUFhLGtCQUFtQixTQUFRLG1CQUFLO0lBQ3pDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBOEI7O1FBQ3BFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUN0RSxhQUFhLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsbUJBQVUsZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUMxSCxjQUFjLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsbUJBQVUsZ0JBQWdCLENBQUM7U0FDM0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcs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UTtvQkFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUMxQjtnQkFDRDtvQkFDSSxTQUFTLEVBQUUsT0FBTztvQkFDbEIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO2lCQUN6QjtnQkFDRDtvQkFDSSxTQUFTLEVBQUUsU0FBUztvQkFDcEIsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUM7aUJBQ2xDO2dCQUNEO29CQUNJLFNBQVMsRUFBRSxRQUFRO29CQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzFCO2FBQ0o7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFoSEQsZ0RBZ0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgc3NtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zc20nO1xuXG5pbXBvcnQgKiBhcyBlY3IgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcic7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBjb2RlYnVpbGQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgKiBhcyBjb2RlcGlwZWxpbmUgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVwaXBlbGluZSc7XG5pbXBvcnQgKiBhcyBjb2RlY29tbWl0IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlY29tbWl0JztcbmltcG9ydCAqIGFzIGNvZGVwaXBlbGluZV9hY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9ucyc7XG5cbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5pbXBvcnQgeyBDTFVTVEVSX05BTUUgfSBmcm9tICcuLi8uLi9lY3MtZmFyZ2F0ZS1jbHVzdGVyL2xpYi9jbHVzdGVyLWNvbmZpZyc7XG5pbXBvcnQgeyBTU01fUFJFRklYIH0gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7IElCYXNlU2VydmljZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVjc0NvZGVEZXBsb3lTdGFja1Byb3BzIGV4dGVuZHMgU3RhY2tQcm9wcyB7XG4gICAgc3RhZ2U6IHN0cmluZztcbiAgICBzZXJ2aWNlTmFtZTogc3RyaW5nO1xufVxuLyoqXG4gKiBTU00gcGFyYW1ldGVyczpcbiAqIC9jZGstZWNzLWZhcmdhdGUvZWNyLXJlcG8tYXJuXG4gKiAvY2RrLWVjcy1mYXJnYXRlL2Vjci1yZXBvLW5hbWVcbiAqIC9jZGstZWNzLWZhcmdhdGUvY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkXG4gKiAvY2RrLWVjcy1mYXJnYXRlL2NsdXN0ZXItbmFtZVxuICogL2Nkay1lY3MtZmFyZ2F0ZS9jb2RlY29tbWl0LWFyblxuICovXG5leHBvcnQgY2xhc3MgRWNzQ29kZURlcGxveVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFY3NDb2RlRGVwbG95U3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgICAgICBjb25zdCBlY3JSZXBvID0gZWNyLlJlcG9zaXRvcnkuZnJvbVJlcG9zaXRvcnlBdHRyaWJ1dGVzKHRoaXMsICdlY3ItcmVwbycsIHtcbiAgICAgICAgICAgIHJlcG9zaXRvcnlBcm46IGNkay5MYXp5LnN0cmluZyh7IHByb2R1Y2U6ICgpID0+IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L2Vjci1yZXBvLWFybmApIH0pLFxuICAgICAgICAgICAgcmVwb3NpdG9yeU5hbWU6IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L2Vjci1yZXBvLW5hbWVgKVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB2cGNJZCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCd2cGNJZCcpIHx8IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L3ZwYy1pZGApO1xuICAgICAgICBjb25zdCB2cGMgPSBlYzIuVnBjLmZyb21Mb29rdXAodGhpcywgJ3ZwYycsIHsgdnBjSWQgfSk7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJTZ0lkID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkYCk7XG4gICAgICAgIGNvbnN0IGVjc1NlY3VyaXR5R3JvdXAgPSBlYzIuU2VjdXJpdHlHcm91cC5mcm9tU2VjdXJpdHlHcm91cElkKHRoaXMsICdlY3Mtc2VjdXJpdHktZ3JvdXAnLCBjbHVzdGVyU2dJZCk7XG5cbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGVjcy5DbHVzdGVyLmZyb21DbHVzdGVyQXR0cmlidXRlcyh0aGlzLCAnZWNzLWZhcmdhdGUtY2x1c3RlcicsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBgJHtDTFVTVEVSX05BTUV9LSR7cHJvcHMuc3RhZ2V9YCxcbiAgICAgICAgICAgIHZwYyxcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbZWNzU2VjdXJpdHlHcm91cF1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBlY3MuRmFyZ2F0ZVNlcnZpY2UuZnJvbUZhcmdhdGVTZXJ2aWNlQXR0cmlidXRlcyh0aGlzLCAnZmFyZ2F0ZS1jbHVzdGVyJywge1xuICAgICAgICAgICAgY2x1c3RlcixcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lOiBjZGsuTGF6eS5zdHJpbmcoeyBwcm9kdWNlOiAoKSA9PiBzc20uU3RyaW5nUGFyYW1ldGVyLnZhbHVlRnJvbUxvb2t1cCh0aGlzLCBgJHtTU01fUFJFRklYfS9jbHVzdGVyLW5hbWVgKSB9KVxuICAgICAgICB9KSBhcyBJQmFzZVNlcnZpY2U7XG5cbiAgICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBwcm9wcy5zZXJ2aWNlTmFtZTtcbiAgICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IGNvZGVjb21taXQuUmVwb3NpdG9yeS5mcm9tUmVwb3NpdG9yeUFybih0aGlzLCBgJHtzZXJ2aWNlTmFtZX0tY29kZWNvbW1pdC1hcm5gLFxuICAgICAgICAgICAgY2RrLkxhenkuc3RyaW5nKHsgcHJvZHVjZTogKCkgPT4gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vY29kZWNvbW1pdC1hcm5gKSB9KSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGJ1aWxkSW1hZ2U6IGNvZGVidWlsZC5MaW51eEJ1aWxkSW1hZ2UuQU1BWk9OX0xJTlVYXzJfNCxcbiAgICAgICAgICogYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5mcm9tRG9ja2VyUmVnaXN0cnkoJ3B1YmxpYy5lY3IuYXdzL2gxYTVzOWg4L2FscGluZTpsYXRlc3QnKVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBjb2RlYnVpbGQuUHJvamVjdCh0aGlzLCBgY2ItcHJvamVjdC0ke3NlcnZpY2VOYW1lfWAsIHtcbiAgICAgICAgICAgIHByb2plY3ROYW1lOiBgJHtzZXJ2aWNlTmFtZX0tYnVpbGRgLFxuICAgICAgICAgICAgc291cmNlOiBjb2RlYnVpbGQuU291cmNlLmNvZGVDb21taXQoeyByZXBvc2l0b3J5IH0pLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBidWlsZEltYWdlOiBjb2RlYnVpbGQuTGludXhCdWlsZEltYWdlLlNUQU5EQVJEXzZfMCxcbiAgICAgICAgICAgICAgICBwcml2aWxlZ2VkOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnVpbGRTcGVjOiBjb2RlYnVpbGQuQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZSgnLi9idWlsZHNwZWMueWFtbCcpLFxuICAgICAgICAgICAgYmFkZ2U6IHRydWUsXG4gICAgICAgICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICdBQ0NPVU5UX0lEJzoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcHM/LmVudj8uYWNjb3VudFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ0NMVVNURVJfTkFNRSc6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGAke3NlcnZpY2UuY2x1c3Rlci5jbHVzdGVyTmFtZX1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnU0VSVklDRV9OQU1FJzoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYCR7c2VydmljZS5zZXJ2aWNlTmFtZX1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnRUNSX1JFUE9fVVJJJzoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYCR7ZWNyUmVwby5yZXBvc2l0b3J5VXJpfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBlY3JSZXBvLmdyYW50UHVsbFB1c2gocHJvamVjdC5yb2xlISk7XG4gICAgICAgIHByb2plY3Qucm9sZT8uYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvbkVDMkNvbnRhaW5lclJlZ2lzdHJ5UG93ZXJVc2VyJykpO1xuXG4gICAgICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcbiAgICAgICAgY29uc3QgYnVpbGRPdXRwdXQgPSBuZXcgY29kZXBpcGVsaW5lLkFydGlmYWN0KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGF3cyBzZWNyZXRzbWFuYWdlciBjcmVhdGUtc2VjcmV0IC0tbmFtZSAnL2dpdGh1Yi90b2tlbicgLS1zZWNyZXQtc3RyaW5nIHt5b3VyLXRva2VufVxuICAgICAgICAgKiBvciBzZXQgdGhlIHRva2VuIHdpdGggb2F1dGhUb2tlbjogY2RrLlNlY3JldFZhbHVlLnBsYWluVGV4dCgnPHBsYWluLXRleHQ+JyksXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuR2l0SHViU291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdHaXRIdWJfU291cmNlJyxcbiAgICAgICAgICAgIG93bmVyOiAnZW5nZWw4MCcsXG4gICAgICAgICAgICByZXBvOiAnZmFyZ2F0ZS1yZXN0YXBpLWxvY2FsJyxcbiAgICAgICAgICAgIGJyYW5jaDogJ21hc3RlcicsXG4gICAgICAgICAgICBvYXV0aFRva2VuOiBjZGsuU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoXCIvZ2l0aHViL3Rva2VuXCIpLFxuICAgICAgICAgICAgb3V0cHV0OiBzb3VyY2VPdXRwdXRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYnVpbGRBY3Rpb24gPSBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuQ29kZUJ1aWxkQWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdDb2RlQnVpbGQnLFxuICAgICAgICAgICAgcHJvamVjdCxcbiAgICAgICAgICAgIGlucHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICAgICAgICBvdXRwdXRzOiBbYnVpbGRPdXRwdXRdLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbWFudWFsQXBwcm92YWxBY3Rpb24gPSBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuTWFudWFsQXBwcm92YWxBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uTmFtZTogJ0FwcHJvdmUnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZGVwbG95QWN0aW9uID0gbmV3IGNvZGVwaXBlbGluZV9hY3Rpb25zLkVjc0RlcGxveUFjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25OYW1lOiAnRGVwbG95QWN0aW9uJyxcbiAgICAgICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgICAgICBpbWFnZUZpbGU6IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3RQYXRoKGJ1aWxkT3V0cHV0LCBgaW1hZ2VkZWZpbml0aW9ucy5qc29uYClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IGNvZGVwaXBlbGluZS5QaXBlbGluZSh0aGlzLCAnZWNzLWRlcGxveS1waXBlbGluZScsIHtcbiAgICAgICAgICAgIHBpcGVsaW5lTmFtZTogYGVjcy1kZXBsb3ktJHtzZXJ2aWNlLnNlcnZpY2VOYW1lfWAsXG4gICAgICAgICAgICBzdGFnZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWdlTmFtZTogJ1NvdXJjZScsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtzb3VyY2VBY3Rpb25dLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdCdWlsZCcsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtidWlsZEFjdGlvbl0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWdlTmFtZTogJ0FwcHJvdmUnLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbbWFudWFsQXBwcm92YWxBY3Rpb25dLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdEZXBsb3knLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbZGVwbG95QWN0aW9uXSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==