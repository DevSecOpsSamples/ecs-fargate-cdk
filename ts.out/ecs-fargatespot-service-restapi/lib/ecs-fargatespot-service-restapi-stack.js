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
exports.FargateSpotRestAPIServiceStack = void 0;
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
 * Crearte Fargate Service with Spot CapacityProvider, Auto Scaling, ALB, and Log Group.
 * Set the ALB logs for the production-level.
 */
class FargateSpotRestAPIServiceStack extends aws_cdk_lib_1.Stack {
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
        const serviceName = 'fargatespot-restapi';
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
        const container = taskDefinition.addContainer('container-restapi', {
            containerName,
            image: ecs.ContainerImage.fromRegistry(`${(_a = props.env) === null || _a === void 0 ? void 0 : _a.account}.dkr.ecr.${(_b = props.env) === null || _b === void 0 ? void 0 : _b.region}.amazonaws.com/fargate-restapi-${props.stage}:latest`),
            // or build with /app folder
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
            healthCheckGracePeriod: aws_cdk_lib_1.Duration.seconds(0),
            capacityProviderStrategies: [
                {
                    capacityProvider: 'FARGATE_SPOT',
                    weight: 1,
                },
                {
                    capacityProvider: 'FARGATE',
                    weight: 1,
                }
            ]
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
exports.FargateSpotRestAPIServiceStack = FargateSpotRestAPIServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWZhcmdhdGVzcG90LXNlcnZpY2UtcmVzdGFwaS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Vjcy1mYXJnYXRlc3BvdC1zZXJ2aWNlLXJlc3RhcGkvbGliL2Vjcy1mYXJnYXRlc3BvdC1zZXJ2aWNlLXJlc3RhcGktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUNuQyw2Q0FBK0Q7QUFDL0QseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyw4RUFBZ0U7QUFDaEUsMkRBQTZDO0FBQzdDLHlEQUEyQztBQUMzQyx5REFBMkM7QUFFM0MsaUZBQTRFO0FBQzVFLHlDQUE0RDtBQUU1RDs7O0dBR0c7QUFDSCxNQUFhLDhCQUErQixTQUFRLG1CQUFLO0lBQ3JELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7O1FBQzdELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLG1CQUFVLFNBQVMsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLG1CQUFVLDJCQUEyQixDQUFDLENBQUM7UUFDeEcsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV4RyxN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QyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUU1RCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNyRSxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztDQUNKO0FBMUhELHdFQTBIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBTdGFjaywgQ2ZuT3V0cHV0LCBEdXJhdGlvbiwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xyXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XHJcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcclxuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuaW1wb3J0ICogYXMgc3NtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zc20nO1xyXG5cclxuaW1wb3J0IHsgQ0xVU1RFUl9OQU1FIH0gZnJvbSAnLi4vLi4vZWNzLWZhcmdhdGUtY2x1c3Rlci9saWIvY2x1c3Rlci1jb25maWcnO1xyXG5pbXBvcnQgeyBTdGFja0NvbW1vblByb3BzLCBTU01fUFJFRklYIH0gZnJvbSAnLi4vLi4vY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBDcmVhcnRlIEZhcmdhdGUgU2VydmljZSB3aXRoIFNwb3QgQ2FwYWNpdHlQcm92aWRlciwgQXV0byBTY2FsaW5nLCBBTEIsIGFuZCBMb2cgR3JvdXAuXHJcbiAqIFNldCB0aGUgQUxCIGxvZ3MgZm9yIHRoZSBwcm9kdWN0aW9uLWxldmVsLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZhcmdhdGVTcG90UmVzdEFQSVNlcnZpY2VTdGFjayBleHRlbmRzIFN0YWNrIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTdGFja0NvbW1vblByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZwY0lkID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ3ZwY0lkJykgfHwgc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vdnBjLWlkYCk7XHJcbiAgICAgICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tTG9va3VwKHRoaXMsICd2cGMnLCB7IHZwY0lkIH0pO1xyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXJTZ0lkID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkYCk7XHJcbiAgICAgICAgY29uc3QgZWNzU2VjdXJpdHlHcm91cCA9IGVjMi5TZWN1cml0eUdyb3VwLmZyb21TZWN1cml0eUdyb3VwSWQodGhpcywgJ2Vjcy1zZWN1cml0eS1ncm91cCcsIGNsdXN0ZXJTZ0lkKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGVjcy5DbHVzdGVyLmZyb21DbHVzdGVyQXR0cmlidXRlcyh0aGlzLCAnZWNzLWZhcmdhdGUtY2x1c3RlcicsIHtcclxuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGAke0NMVVNURVJfTkFNRX0tJHtwcm9wcy5zdGFnZX1gLFxyXG4gICAgICAgICAgICB2cGMsXHJcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbZWNzU2VjdXJpdHlHcm91cF1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSAnZmFyZ2F0ZXNwb3QtcmVzdGFwaSdcclxuICAgICAgICBjb25zdCBjb250YWluZXJOYW1lID0gYCR7c2VydmljZU5hbWV9LWNvbnRhaW5lcmBcclxuICAgICAgICBjb25zdCBhcHBsaWNhdGlvblBvcnQgPSA4MDgwO1xyXG5cclxuICAgICAgICBjb25zdCBleGVjdXRpb25Sb2xlQXJuID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZyb21Mb29rdXAodGhpcywgYCR7U1NNX1BSRUZJWH0vdGFzay1leGVjdXRpb24tcm9sZS1hcm5gKTtcclxuICAgICAgICBjb25zdCB0YXNrUm9sZUFybiA9IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L2RlZmF1bHQtdGFzay1yb2xlLWFybmApO1xyXG5cclxuICAgICAgICBjb25zdCB0YXNrRGVmaW5pdGlvbiA9IG5ldyBlY3MuVGFza0RlZmluaXRpb24odGhpcywgJ2ZhcmdhdGUtdGFzay1kZWZpbml0aW9uJywge1xyXG4gICAgICAgICAgICBjcHU6ICcxMDI0JyxcclxuICAgICAgICAgICAgbWVtb3J5TWlCOiAnMjA0OCcsXHJcbiAgICAgICAgICAgIGNvbXBhdGliaWxpdHk6IGVjcy5Db21wYXRpYmlsaXR5LkZBUkdBVEUsXHJcbiAgICAgICAgICAgIGZhbWlseTogYCR7c2VydmljZU5hbWV9LXRhc2tgLFxyXG4gICAgICAgICAgICBleGVjdXRpb25Sb2xlOiBpYW0uUm9sZS5mcm9tUm9sZUFybih0aGlzLCAndGFzay1leGVjdXRpb24tcm9sZScsIGNkay5MYXp5LnN0cmluZyh7IHByb2R1Y2U6ICgpID0+IGV4ZWN1dGlvblJvbGVBcm4gfSkpLFxyXG4gICAgICAgICAgICB0YXNrUm9sZTogaWFtLlJvbGUuZnJvbVJvbGVBcm4odGhpcywgJ3Rhc2stcm9sZScsIGNkay5MYXp5LnN0cmluZyh7IHByb2R1Y2U6ICgpID0+IHRhc2tSb2xlQXJuIH0pKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRhc2tEZWZpbml0aW9uLmFkZENvbnRhaW5lcignY29udGFpbmVyLXJlc3RhcGknLCB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lck5hbWUsXHJcbiAgICAgICAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbVJlZ2lzdHJ5KGAke3Byb3BzLmVudj8uYWNjb3VudH0uZGtyLmVjci4ke3Byb3BzLmVudj8ucmVnaW9ufS5hbWF6b25hd3MuY29tL2ZhcmdhdGUtcmVzdGFwaS0ke3Byb3BzLnN0YWdlfTpsYXRlc3RgKSxcclxuICAgICAgICAgICAgLy8gb3IgYnVpbGQgd2l0aCAvYXBwIGZvbGRlclxyXG4gICAgICAgICAgICAvLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG4gICAgICAgICAgICAvLyBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL1wiLCBcImFwcFwiKSksXHJcbiAgICAgICAgICAgIGNwdTogMTAyNCxcclxuICAgICAgICAgICAgbWVtb3J5UmVzZXJ2YXRpb25NaUI6IDIwNDhcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHsgY29udGFpbmVyUG9ydDogYXBwbGljYXRpb25Qb3J0LCBob3N0UG9ydDogYXBwbGljYXRpb25Qb3J0IH0pO1xyXG5cclxuICAgICAgICBjb25zdCBmYXJnYXRlc2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ2Vjcy1mYXJnYXRlLXNlcnZpY2UnLCB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXIsXHJcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lOiBgJHtzZXJ2aWNlTmFtZX0tJHtwcm9wcy5zdGFnZX1gLFxyXG4gICAgICAgICAgICB0YXNrRGVmaW5pdGlvbixcclxuICAgICAgICAgICAgZW5hYmxlRXhlY3V0ZUNvbW1hbmQ6IHRydWUsXHJcbiAgICAgICAgICAgIG1pbkhlYWx0aHlQZXJjZW50OiAxMDAsXHJcbiAgICAgICAgICAgIG1heEhlYWx0aHlQZXJjZW50OiAyMDAsXHJcbiAgICAgICAgICAgIGhlYWx0aENoZWNrR3JhY2VQZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoMCksIC8vIHNldCB0aGUgdmFsdWUgYXMgeW91ciBhcHBsaWNhdGlvbiBpbml0aWFsaXplIHRpbWUgXHJcbiAgICAgICAgICAgIGNhcGFjaXR5UHJvdmlkZXJTdHJhdGVnaWVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FwYWNpdHlQcm92aWRlcjogJ0ZBUkdBVEVfU1BPVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXBhY2l0eVByb3ZpZGVyOiAnRkFSR0FURScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAxLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZmFyZ2F0ZXNlcnZpY2UuYXV0b1NjYWxlVGFza0NvdW50KHtcclxuICAgICAgICAgICAgbWluQ2FwYWNpdHk6IDIsXHJcbiAgICAgICAgICAgIG1heENhcGFjaXR5OiAxMDAsXHJcbiAgICAgICAgfSkuc2NhbGVPbkNwdVV0aWxpemF0aW9uKCdjcHVzY2FsaW5nJywge1xyXG4gICAgICAgICAgICB0YXJnZXRVdGlsaXphdGlvblBlcmNlbnQ6IDUwLFxyXG4gICAgICAgICAgICBzY2FsZU91dENvb2xkb3duOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcclxuICAgICAgICAgICAgc2NhbGVJbkNvb2xkb3duOiBEdXJhdGlvbi5zZWNvbmRzKDEyMClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnbG9nZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogc2VydmljZU5hbWUsXHJcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgICAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLlRXT19XRUVLUyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxiU2VjdXJpdHlHcm91cE5hbWUgPSBgYWxic2ctJHtzZXJ2aWNlTmFtZX1gXHJcbiAgICAgICAgY29uc3QgYWxiU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCBhbGJTZWN1cml0eUdyb3VwTmFtZSwge1xyXG4gICAgICAgICAgICBzZWN1cml0eUdyb3VwTmFtZTogYWxiU2VjdXJpdHlHcm91cE5hbWUsXHJcbiAgICAgICAgICAgIHZwYyxcclxuICAgICAgICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBBTEIgc2VjdXJpdHkgZ3JvdXAgZm9yICR7c2VydmljZU5hbWV9IFNlcnZpY2VgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZWNzU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShhbGJTZWN1cml0eUdyb3VwLCBlYzIuUG9ydC50Y3AoYXBwbGljYXRpb25Qb3J0KSwgJ0FsbG93IGZyb20gQUxCJyk7XHJcbiAgICAgICAgYWxiU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCg4MCksICdBbGxvdyBhbnknKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxiID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHRoaXMsICdhbGInLCB7XHJcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXA6IGFsYlNlY3VyaXR5R3JvdXAsXHJcbiAgICAgICAgICAgIHZwYyxcclxuICAgICAgICAgICAgbG9hZEJhbGFuY2VyTmFtZTogYGFsYi0ke3NlcnZpY2VOYW1lfWAsXHJcbiAgICAgICAgICAgIGludGVybmV0RmFjaW5nOiB0cnVlLFxyXG4gICAgICAgICAgICBkZWxldGlvblByb3RlY3Rpb246IGZhbHNlLFxyXG4gICAgICAgICAgICBpZGxlVGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFsYi5hZGRMaXN0ZW5lcignaHR0cHMtbGlzdGVuZXInLCB7XHJcbiAgICAgICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXHJcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICAgIH0pLmFkZFRhcmdldHMoJ2VjMi1zZXJ2aWNlLXRhcmdldCcsIHtcclxuICAgICAgICAgICAgdGFyZ2V0R3JvdXBOYW1lOiBgdGctJHtzZXJ2aWNlTmFtZX1gLFxyXG4gICAgICAgICAgICBwb3J0OiBhcHBsaWNhdGlvblBvcnQsXHJcbiAgICAgICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXHJcbiAgICAgICAgICAgIHRhcmdldHM6IFtmYXJnYXRlc2VydmljZS5sb2FkQmFsYW5jZXJUYXJnZXQoe1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyTmFtZTogY29udGFpbmVyTmFtZSxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBvcnQ6IGFwcGxpY2F0aW9uUG9ydCxcclxuICAgICAgICAgICAgfSldLFxyXG4gICAgICAgICAgICBoZWFsdGhDaGVjazoge1xyXG4gICAgICAgICAgICAgICAgaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxyXG4gICAgICAgICAgICAgICAgdW5oZWFsdGh5VGhyZXNob2xkQ291bnQ6IDUsXHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogRHVyYXRpb24uc2Vjb25kcygzMSksXHJcbiAgICAgICAgICAgICAgICBwYXRoOiAnL3BpbmcnLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlcmVnaXN0cmF0aW9uRGVsYXk6IER1cmF0aW9uLnNlY29uZHMoMTUpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFRhZ3Mub2YoYWxiU2VjdXJpdHlHcm91cCkuYWRkKCdTdGFnZScsIHByb3BzLnN0YWdlKTtcclxuICAgICAgICBUYWdzLm9mKGFsYlNlY3VyaXR5R3JvdXApLmFkZCgnTmFtZScsIGFsYlNlY3VyaXR5R3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnU2VydmljZScsIHsgdmFsdWU6IGZhcmdhdGVzZXJ2aWNlLnNlcnZpY2VBcm4gfSk7XHJcbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnVGFza0RlZmluaXRpb24nLCB7IHZhbHVlOiB0YXNrRGVmaW5pdGlvbi5mYW1pbHkgfSk7XHJcbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnTG9nR3JvdXAnLCB7IHZhbHVlOiBsb2dHcm91cC5sb2dHcm91cE5hbWUgfSk7XHJcbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQUxCJywgeyB2YWx1ZTogYWxiLmxvYWRCYWxhbmNlckRuc05hbWUgfSk7XHJcbiAgICB9XHJcbn1cclxuIl19