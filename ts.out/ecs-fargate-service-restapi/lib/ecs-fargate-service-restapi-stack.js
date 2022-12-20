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
exports.FargateRestAPIServiceStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const elbv2 = __importStar(require("aws-cdk-lib/aws-elasticloadbalancingv2"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const cluster_config_1 = require("../../ecs-fargate-cluster/lib/cluster-config");
const config_1 = require("../../config");
/**
 * Crearte Fargate Service, Auto Scaling, ALB, and Log Group.
 * Set the ALB options for the production-level.
 */
class FargateRestAPIServiceStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id, props);
        const vpcId = this.node.tryGetContext('vpcId') || ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/vpc-id`);
        const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcId });
        const clusterSgId = ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/cluster-securitygroup-id`);
        const ecsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ecs-security-group', clusterSgId);
        const cluster = ecs.Cluster.fromClusterAttributes(this, 'ecs-fargate-cluster', {
            clusterName: `${cluster_config_1.CLUSTER_NAME}-${props.stage}`,
            vpc,
            securityGroups: [ecsSecurityGroup]
        });
        const serviceName = 'fargate-restapi';
        const containerName = `${serviceName}-container`;
        const applicationPort = 8080;
        const executionRoleArn = ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/task-execution-role-arn`);
        const taskRoleArn = ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/default-task-role-arn`);
        const taskDefinition = new ecs.TaskDefinition(this, 'fargate-task-definition', {
            cpu: '1024',
            memoryMiB: '2048',
            compatibility: ecs.Compatibility.FARGATE,
            family: `${serviceName}-task`,
            executionRole: iam.Role.fromRoleArn(this, 'task-execution-role', cdk.Lazy.string({ produce: () => executionRoleArn })),
            taskRole: iam.Role.fromRoleArn(this, 'task-role', cdk.Lazy.string({ produce: () => taskRoleArn }))
        });
        const regUrl = `${(_a = props.env) === null || _a === void 0 ? void 0 : _a.account}.dkr.ecr.${(_b = props.env) === null || _b === void 0 ? void 0 : _b.region}.amazonaws.com/fargate-restapi-${props.stage}:latest`;
        const container = taskDefinition.addContainer('container-restapi', {
            containerName,
            image: ecs.ContainerImage.fromRegistry(regUrl),
            // or build with /app folder asset
            // import * as path from 'path';
            // image: ecs.ContainerImage.fromAsset(path.join(__dirname, "../../", "app")),
            cpu: 1024,
            memoryReservationMiB: 2048
        });
        container.addPortMappings({ containerPort: applicationPort, hostPort: applicationPort });
        const fargateservice = new ecs.FargateService(this, 'ecs-fargate-service', {
            cluster,
            serviceName: `${serviceName}-${props.stage}`,
            taskDefinition,
            enableExecuteCommand: true,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            healthCheckGracePeriod: aws_cdk_lib_1.Duration.seconds(0) // set the value as your application initialize time 
        });
        fargateservice.autoScaleTaskCount({
            minCapacity: 2,
            maxCapacity: 100,
        }).scaleOnCpuUtilization('cpuscaling', {
            targetUtilizationPercent: 50,
            scaleOutCooldown: aws_cdk_lib_1.Duration.seconds(60),
            scaleInCooldown: aws_cdk_lib_1.Duration.seconds(120)
        });
        const logGroup = new logs.LogGroup(this, 'loggroup', {
            logGroupName: serviceName,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.TWO_WEEKS,
        });
        const albSecurityGroupName = `albsg-${serviceName}`;
        const albSecurityGroup = new ec2.SecurityGroup(this, albSecurityGroupName, {
            securityGroupName: albSecurityGroupName,
            vpc,
            allowAllOutbound: true,
            description: `ALB security group for ${serviceName} Service`
        });
        ecsSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(applicationPort), 'Allow from ALB');
        albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow any');
        const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
            securityGroup: albSecurityGroup,
            vpc,
            loadBalancerName: `alb-${serviceName}`,
            internetFacing: true,
            deletionProtection: false,
            idleTimeout: cdk.Duration.seconds(30),
        });
        alb.addListener('https-listener', {
            protocol: elbv2.ApplicationProtocol.HTTP,
            open: false,
        }).addTargets('ec2-service-target', {
            targetGroupName: `tg-${serviceName}`,
            port: applicationPort,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [fargateservice.loadBalancerTarget({
                    containerName: containerName,
                    containerPort: applicationPort,
                })],
            healthCheck: {
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 5,
                interval: aws_cdk_lib_1.Duration.seconds(31),
                path: '/ping',
                timeout: aws_cdk_lib_1.Duration.seconds(30),
            },
            deregistrationDelay: aws_cdk_lib_1.Duration.seconds(15)
        });
        aws_cdk_lib_1.Tags.of(albSecurityGroup).add('Stage', props.stage);
        aws_cdk_lib_1.Tags.of(albSecurityGroup).add('Name', albSecurityGroupName);
        new aws_cdk_lib_1.CfnOutput(this, 'Service', { value: fargateservice.serviceArn });
        new aws_cdk_lib_1.CfnOutput(this, 'TaskDefinition', { value: taskDefinition.family });
        new aws_cdk_lib_1.CfnOutput(this, 'LogGroup', { value: logGroup.logGroupName });
        new aws_cdk_lib_1.CfnOutput(this, 'ALB', { value: alb.loadBalancerDnsName });
    }
}
exports.FargateRestAPIServiceStack = FargateRestAPIServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWZhcmdhdGUtc2VydmljZS1yZXN0YXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vZWNzLWZhcmdhdGUtc2VydmljZS1yZXN0YXBpL2xpYi9lY3MtZmFyZ2F0ZS1zZXJ2aWNlLXJlc3RhcGktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUNuQyw2Q0FBK0Q7QUFDL0QseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyw4RUFBZ0U7QUFDaEUsMkRBQTZDO0FBQzdDLHlEQUEyQztBQUMzQyx5REFBMkM7QUFFM0MsaUZBQTRFO0FBQzVFLHlDQUE0RDtBQUU1RDs7O0dBR0c7QUFDSCxNQUFhLDBCQUEyQixTQUFRLG1CQUFLO0lBQ2pELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7O1FBQzdELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLG1CQUFVLFNBQVMsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLG1CQUFVLDJCQUEyQixDQUFDLENBQUM7UUFDeEcsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV4RyxNQUFNLE9BQU8sR0FB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Q0FBQyxDQUFDO1FBQ3JFLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEUsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDbEUsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUNuRSxDQUFDO0NBQ0o7QUFqSEQsZ0VBaUhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IFN0YWNrLCBDZm5PdXRwdXQsIER1cmF0aW9uLCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcclxuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xyXG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgKiBhcyBzc20gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XHJcblxyXG5pbXBvcnQgeyBDTFVTVEVSX05BTUUgfSBmcm9tICcuLi8uLi9lY3MtZmFyZ2F0ZS1jbHVzdGVyL2xpYi9jbHVzdGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IFN0YWNrQ29tbW9uUHJvcHMsIFNTTV9QUkVGSVggfSBmcm9tICcuLi8uLi9jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIENyZWFydGUgRmFyZ2F0ZSBTZXJ2aWNlLCBBdXRvIFNjYWxpbmcsIEFMQiwgYW5kIExvZyBHcm91cC5cclxuICogU2V0IHRoZSBBTEIgb3B0aW9ucyBmb3IgdGhlIHByb2R1Y3Rpb24tbGV2ZWwuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRmFyZ2F0ZVJlc3RBUElTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU3RhY2tDb21tb25Qcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgICAgICBjb25zdCB2cGNJZCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCd2cGNJZCcpIHx8IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L3ZwYy1pZGApO1xyXG4gICAgICAgIGNvbnN0IHZwYyA9IGVjMi5WcGMuZnJvbUxvb2t1cCh0aGlzLCAndnBjJywgeyB2cGNJZCB9KTtcclxuICAgICAgICBjb25zdCBjbHVzdGVyU2dJZCA9IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L2NsdXN0ZXItc2VjdXJpdHlncm91cC1pZGApO1xyXG4gICAgICAgIGNvbnN0IGVjc1NlY3VyaXR5R3JvdXAgPSBlYzIuU2VjdXJpdHlHcm91cC5mcm9tU2VjdXJpdHlHcm91cElkKHRoaXMsICdlY3Mtc2VjdXJpdHktZ3JvdXAnLCBjbHVzdGVyU2dJZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBlY3MuQ2x1c3Rlci5mcm9tQ2x1c3RlckF0dHJpYnV0ZXModGhpcywgJ2Vjcy1mYXJnYXRlLWNsdXN0ZXInLCB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBgJHtDTFVTVEVSX05BTUV9LSR7cHJvcHMuc3RhZ2V9YCxcclxuICAgICAgICAgICAgdnBjLFxyXG4gICAgICAgICAgICBzZWN1cml0eUdyb3VwczogW2Vjc1NlY3VyaXR5R3JvdXBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSAnZmFyZ2F0ZS1yZXN0YXBpJ1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lck5hbWUgPSBgJHtzZXJ2aWNlTmFtZX0tY29udGFpbmVyYFxyXG4gICAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUG9ydCA9IDgwODA7XHJcblxyXG4gICAgICAgIGNvbnN0IGV4ZWN1dGlvblJvbGVBcm4gPSBzc20uU3RyaW5nUGFyYW1ldGVyLnZhbHVlRnJvbUxvb2t1cCh0aGlzLCBgJHtTU01fUFJFRklYfS90YXNrLWV4ZWN1dGlvbi1yb2xlLWFybmApO1xyXG4gICAgICAgIGNvbnN0IHRhc2tSb2xlQXJuID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vZGVmYXVsdC10YXNrLXJvbGUtYXJuYCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRhc2tEZWZpbml0aW9uID0gbmV3IGVjcy5UYXNrRGVmaW5pdGlvbih0aGlzLCAnZmFyZ2F0ZS10YXNrLWRlZmluaXRpb24nLCB7XHJcbiAgICAgICAgICAgIGNwdTogJzEwMjQnLFxyXG4gICAgICAgICAgICBtZW1vcnlNaUI6ICcyMDQ4JyxcclxuICAgICAgICAgICAgY29tcGF0aWJpbGl0eTogZWNzLkNvbXBhdGliaWxpdHkuRkFSR0FURSxcclxuICAgICAgICAgICAgZmFtaWx5OiBgJHtzZXJ2aWNlTmFtZX0tdGFza2AsXHJcbiAgICAgICAgICAgIGV4ZWN1dGlvblJvbGU6IGlhbS5Sb2xlLmZyb21Sb2xlQXJuKHRoaXMsICd0YXNrLWV4ZWN1dGlvbi1yb2xlJywgY2RrLkxhenkuc3RyaW5nKHsgcHJvZHVjZTogKCkgPT4gZXhlY3V0aW9uUm9sZUFybiB9KSksXHJcbiAgICAgICAgICAgIHRhc2tSb2xlOiBpYW0uUm9sZS5mcm9tUm9sZUFybih0aGlzLCAndGFzay1yb2xlJywgY2RrLkxhenkuc3RyaW5nKHsgcHJvZHVjZTogKCkgPT4gdGFza1JvbGVBcm4gfSkpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcmVnVXJsID0gYCR7cHJvcHMuZW52Py5hY2NvdW50fS5ka3IuZWNyLiR7cHJvcHMuZW52Py5yZWdpb259LmFtYXpvbmF3cy5jb20vZmFyZ2F0ZS1yZXN0YXBpLSR7cHJvcHMuc3RhZ2V9OmxhdGVzdGA7XHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKCdjb250YWluZXItcmVzdGFwaScsIHtcclxuICAgICAgICAgICAgY29udGFpbmVyTmFtZSxcclxuICAgICAgICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tUmVnaXN0cnkocmVnVXJsKSxcclxuICAgICAgICAgICAgLy8gb3IgYnVpbGQgd2l0aCAvYXBwIGZvbGRlciBhc3NldFxyXG4gICAgICAgICAgICAvLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG4gICAgICAgICAgICAvLyBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL1wiLCBcImFwcFwiKSksXHJcbiAgICAgICAgICAgIGNwdTogMTAyNCxcclxuICAgICAgICAgICAgbWVtb3J5UmVzZXJ2YXRpb25NaUI6IDIwNDhcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHsgY29udGFpbmVyUG9ydDogYXBwbGljYXRpb25Qb3J0LCBob3N0UG9ydDogYXBwbGljYXRpb25Qb3J0IH0pO1xyXG5cclxuICAgICAgICBjb25zdCBmYXJnYXRlc2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ2Vjcy1mYXJnYXRlLXNlcnZpY2UnLCB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXIsXHJcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lOiBgJHtzZXJ2aWNlTmFtZX0tJHtwcm9wcy5zdGFnZX1gLFxyXG4gICAgICAgICAgICB0YXNrRGVmaW5pdGlvbixcclxuICAgICAgICAgICAgZW5hYmxlRXhlY3V0ZUNvbW1hbmQ6IHRydWUsXHJcbiAgICAgICAgICAgIG1pbkhlYWx0aHlQZXJjZW50OiAxMDAsXHJcbiAgICAgICAgICAgIG1heEhlYWx0aHlQZXJjZW50OiAyMDAsXHJcbiAgICAgICAgICAgIGhlYWx0aENoZWNrR3JhY2VQZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoMCkgLy8gc2V0IHRoZSB2YWx1ZSBhcyB5b3VyIGFwcGxpY2F0aW9uIGluaXRpYWxpemUgdGltZSBcclxuICAgICAgICB9KTtcclxuICAgICAgICBmYXJnYXRlc2VydmljZS5hdXRvU2NhbGVUYXNrQ291bnQoe1xyXG4gICAgICAgICAgICBtaW5DYXBhY2l0eTogMixcclxuICAgICAgICAgICAgbWF4Q2FwYWNpdHk6IDEwMCxcclxuICAgICAgICB9KS5zY2FsZU9uQ3B1VXRpbGl6YXRpb24oJ2NwdXNjYWxpbmcnLCB7XHJcbiAgICAgICAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogNTAsXHJcbiAgICAgICAgICAgIHNjYWxlT3V0Q29vbGRvd246IER1cmF0aW9uLnNlY29uZHMoNjApLFxyXG4gICAgICAgICAgICBzY2FsZUluQ29vbGRvd246IER1cmF0aW9uLnNlY29uZHMoMTIwKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdsb2dncm91cCcsIHtcclxuICAgICAgICAgICAgbG9nR3JvdXBOYW1lOiBzZXJ2aWNlTmFtZSxcclxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuVFdPX1dFRUtTLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBhbGJTZWN1cml0eUdyb3VwTmFtZSA9IGBhbGJzZy0ke3NlcnZpY2VOYW1lfWBcclxuICAgICAgICBjb25zdCBhbGJTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsIGFsYlNlY3VyaXR5R3JvdXBOYW1lLCB7XHJcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiBhbGJTZWN1cml0eUdyb3VwTmFtZSxcclxuICAgICAgICAgICAgdnBjLFxyXG4gICAgICAgICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYEFMQiBzZWN1cml0eSBncm91cCBmb3IgJHtzZXJ2aWNlTmFtZX0gU2VydmljZWBcclxuICAgICAgICB9KTtcclxuICAgICAgICBlY3NTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGFsYlNlY3VyaXR5R3JvdXAsIGVjMi5Qb3J0LnRjcChhcHBsaWNhdGlvblBvcnQpLCAnQWxsb3cgZnJvbSBBTEInKTtcclxuICAgICAgICBhbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGVjMi5QZWVyLmFueUlwdjQoKSwgZWMyLlBvcnQudGNwKDgwKSwgJ0FsbG93IGFueScpO1xyXG5cclxuICAgICAgICBjb25zdCBhbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgJ2FsYicsIHtcclxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cDogYWxiU2VjdXJpdHlHcm91cCxcclxuICAgICAgICAgICAgdnBjLFxyXG4gICAgICAgICAgICBsb2FkQmFsYW5jZXJOYW1lOiBgYWxiLSR7c2VydmljZU5hbWV9YCxcclxuICAgICAgICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXHJcbiAgICAgICAgICAgIGRlbGV0aW9uUHJvdGVjdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGlkbGVUaW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYWxiLmFkZExpc3RlbmVyKCdodHRwcy1saXN0ZW5lcicsIHtcclxuICAgICAgICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcclxuICAgICAgICAgICAgb3BlbjogZmFsc2UsXHJcbiAgICAgICAgfSkuYWRkVGFyZ2V0cygnZWMyLXNlcnZpY2UtdGFyZ2V0Jywge1xyXG4gICAgICAgICAgICB0YXJnZXRHcm91cE5hbWU6IGB0Zy0ke3NlcnZpY2VOYW1lfWAsXHJcbiAgICAgICAgICAgIHBvcnQ6IGFwcGxpY2F0aW9uUG9ydCxcclxuICAgICAgICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcclxuICAgICAgICAgICAgdGFyZ2V0czogW2ZhcmdhdGVzZXJ2aWNlLmxvYWRCYWxhbmNlclRhcmdldCh7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJOYW1lOiBjb250YWluZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUG9ydDogYXBwbGljYXRpb25Qb3J0LFxyXG4gICAgICAgICAgICB9KV0sXHJcbiAgICAgICAgICAgIGhlYWx0aENoZWNrOiB7XHJcbiAgICAgICAgICAgICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXHJcbiAgICAgICAgICAgICAgICB1bmhlYWx0aHlUaHJlc2hvbGRDb3VudDogNSxcclxuICAgICAgICAgICAgICAgIGludGVydmFsOiBEdXJhdGlvbi5zZWNvbmRzKDMxKSxcclxuICAgICAgICAgICAgICAgIHBhdGg6ICcvcGluZycsXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVyZWdpc3RyYXRpb25EZWxheTogRHVyYXRpb24uc2Vjb25kcygxNSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgVGFncy5vZihhbGJTZWN1cml0eUdyb3VwKS5hZGQoJ1N0YWdlJywgcHJvcHMuc3RhZ2UpO1xyXG4gICAgICAgIFRhZ3Mub2YoYWxiU2VjdXJpdHlHcm91cCkuYWRkKCdOYW1lJywgYWxiU2VjdXJpdHlHcm91cE5hbWUpO1xyXG5cclxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdTZXJ2aWNlJywgeyB2YWx1ZTogZmFyZ2F0ZXNlcnZpY2Uuc2VydmljZUFybiB9KTtcclxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdUYXNrRGVmaW5pdGlvbicsIHsgdmFsdWU6IHRhc2tEZWZpbml0aW9uLmZhbWlseSB9KTtcclxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdMb2dHcm91cCcsIHsgdmFsdWU6IGxvZ0dyb3VwLmxvZ0dyb3VwTmFtZSB9KTtcclxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBTEInLCB7IHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSB9KTtcclxuICAgIH1cclxufVxyXG4iXX0=