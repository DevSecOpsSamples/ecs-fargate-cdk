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
exports.EcsFargateClusterStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const cluster_config_1 = require("../lib/cluster-config");
const config_1 = require("../../config");
/**
 * Create ECS Fargate cluster and shared security group for ALB ingress
 */
class EcsFargateClusterStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const vpcId = this.node.tryGetContext('vpcId') || ssm.StringParameter.valueFromLookup(this, `${config_1.SSM_PREFIX}/vpc-id`);
        const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcId });
        const clusterName = `${cluster_config_1.CLUSTER_NAME}-${props.stage}`;
        const cluster = new ecs.Cluster(this, 'ecs-cluster', {
            vpc,
            clusterName,
            containerInsights: true,
        });
        const securityGroupName = `ecssg-${clusterName}`;
        const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ecs-security-group', {
            vpc,
            securityGroupName,
            description: `ECS Fargate shared security group for ALB ingress, cluster: ${cluster}`,
        });
        aws_cdk_lib_1.Tags.of(ecsSecurityGroup).add('Stage', props.stage);
        aws_cdk_lib_1.Tags.of(ecsSecurityGroup).add('Name', securityGroupName);
        new aws_cdk_lib_1.CfnOutput(this, 'Cluster', { value: cluster.clusterName });
        new aws_cdk_lib_1.CfnOutput(this, 'ECS Security Group ID', { value: ecsSecurityGroup.securityGroupId });
        // cluster-name and cluster-arn is used for deployment pipeline
        new ssm.StringParameter(this, 'ssm-cluster-name', { parameterName: `${config_1.SSM_PREFIX}/cluster-name`, stringValue: cluster.clusterName });
        new ssm.StringParameter(this, 'ssm-cluster-arn', { parameterName: `${config_1.SSM_PREFIX}/cluster-arn`, stringValue: cluster.clusterArn });
        // cluster-securitygroup-id is used to add inboud from ALB to Fargate service
        new ssm.StringParameter(this, 'ssm-cluster-securitygroup-id', { parameterName: `${config_1.SSM_PREFIX}/cluster-securitygroup-id`, stringValue: ecsSecurityGroup.securityGroupId });
    }
}
exports.EcsFargateClusterStack = EcsFargateClusterStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWZhcmdhdGUtY2x1c3Rlci1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Vjcy1mYXJnYXRlLWNsdXN0ZXIvbGliL2Vjcy1mYXJnYXRlLWNsdXN0ZXItc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUFxRDtBQUNyRCx5REFBMkM7QUFDM0MseURBQTJDO0FBQzNDLHlEQUEyQztBQUczQywwREFBcUQ7QUFDckQseUNBQTREO0FBRTVEOztHQUVHO0FBQ0gsTUFBYSxzQkFBdUIsU0FBUSxtQkFBSztJQUM3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXVCO1FBQzdELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLG1CQUFVLFNBQVMsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZELE1BQU0sV0FBVyxHQUFHLEdBQUcsNkJBQVksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckQsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDakQsR0FBRztZQUNILFdBQVc7WUFDWCxpQkFBaUIsRUFBRSxJQUFJO1NBQzFCLENBQUMsQ0FBQztRQUVILE1BQU0saUJBQWlCLEdBQUcsU0FBUyxXQUFXLEVBQUUsQ0FBQztRQUNqRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDdkUsR0FBRztZQUNILGlCQUFpQjtZQUNqQixXQUFXLEVBQUUsK0RBQStELE9BQU8sRUFBRTtTQUN4RixDQUFDLENBQUM7UUFDSCxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELGtCQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXpELElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsRUFBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztRQUV4RiwrREFBK0Q7UUFDL0QsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLG1CQUFVLGVBQWUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDckksSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLG1CQUFVLGNBQWMsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFbEksNkVBQTZFO1FBQzdFLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUUsRUFBRSxhQUFhLEVBQUUsR0FBRyxtQkFBVSwyQkFBMkIsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztJQUM5SyxDQUFDO0NBQ0o7QUFqQ0Qsd0RBaUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIENmbk91dHB1dCwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xyXG5pbXBvcnQgKiBhcyBzc20gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XHJcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcblxyXG5pbXBvcnQgeyBDTFVTVEVSX05BTUUgfSBmcm9tICcuLi9saWIvY2x1c3Rlci1jb25maWcnO1xyXG5pbXBvcnQgeyBTdGFja0NvbW1vblByb3BzLCBTU01fUFJFRklYIH0gZnJvbSAnLi4vLi4vY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgRUNTIEZhcmdhdGUgY2x1c3RlciBhbmQgc2hhcmVkIHNlY3VyaXR5IGdyb3VwIGZvciBBTEIgaW5ncmVzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEVjc0ZhcmdhdGVDbHVzdGVyU3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU3RhY2tDb21tb25Qcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgICAgICBjb25zdCB2cGNJZCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCd2cGNJZCcpIHx8IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGcm9tTG9va3VwKHRoaXMsIGAke1NTTV9QUkVGSVh9L3ZwYy1pZGApO1xyXG4gICAgICAgIGNvbnN0IHZwYyA9IGVjMi5WcGMuZnJvbUxvb2t1cCh0aGlzLCAndnBjJywgeyB2cGNJZCB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgY2x1c3Rlck5hbWUgPSBgJHtDTFVTVEVSX05BTUV9LSR7cHJvcHMuc3RhZ2V9YDtcclxuICAgICAgICBjb25zdCBjbHVzdGVyID0gbmV3IGVjcy5DbHVzdGVyKHRoaXMsICdlY3MtY2x1c3RlcicsIHtcclxuICAgICAgICAgICAgdnBjLFxyXG4gICAgICAgICAgICBjbHVzdGVyTmFtZSxcclxuICAgICAgICAgICAgY29udGFpbmVySW5zaWdodHM6IHRydWUsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3VyaXR5R3JvdXBOYW1lID0gYGVjc3NnLSR7Y2x1c3Rlck5hbWV9YDtcclxuICAgICAgICBjb25zdCBlY3NTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdlY3Mtc2VjdXJpdHktZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgIHZwYyxcclxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cE5hbWUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRUNTIEZhcmdhdGUgc2hhcmVkIHNlY3VyaXR5IGdyb3VwIGZvciBBTEIgaW5ncmVzcywgY2x1c3RlcjogJHtjbHVzdGVyfWAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgVGFncy5vZihlY3NTZWN1cml0eUdyb3VwKS5hZGQoJ1N0YWdlJywgcHJvcHMuc3RhZ2UpO1xyXG4gICAgICAgIFRhZ3Mub2YoZWNzU2VjdXJpdHlHcm91cCkuYWRkKCdOYW1lJywgc2VjdXJpdHlHcm91cE5hbWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NsdXN0ZXInLCB7IHZhbHVlOiBjbHVzdGVyLmNsdXN0ZXJOYW1lIH0pO1xyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0VDUyBTZWN1cml0eSBHcm91cCBJRCcsIHt2YWx1ZTogZWNzU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWR9KTtcclxuXHJcbiAgICAgICAgLy8gY2x1c3Rlci1uYW1lIGFuZCBjbHVzdGVyLWFybiBpcyB1c2VkIGZvciBkZXBsb3ltZW50IHBpcGVsaW5lXHJcbiAgICAgICAgbmV3IHNzbS5TdHJpbmdQYXJhbWV0ZXIodGhpcywgJ3NzbS1jbHVzdGVyLW5hbWUnLCB7IHBhcmFtZXRlck5hbWU6IGAke1NTTV9QUkVGSVh9L2NsdXN0ZXItbmFtZWAsIHN0cmluZ1ZhbHVlOiBjbHVzdGVyLmNsdXN0ZXJOYW1lIH0pO1xyXG4gICAgICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tY2x1c3Rlci1hcm4nLCB7IHBhcmFtZXRlck5hbWU6IGAke1NTTV9QUkVGSVh9L2NsdXN0ZXItYXJuYCwgc3RyaW5nVmFsdWU6IGNsdXN0ZXIuY2x1c3RlckFybiB9KTtcclxuXHJcbiAgICAgICAgLy8gY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkIGlzIHVzZWQgdG8gYWRkIGluYm91ZCBmcm9tIEFMQiB0byBGYXJnYXRlIHNlcnZpY2VcclxuICAgICAgICBuZXcgc3NtLlN0cmluZ1BhcmFtZXRlcih0aGlzLCAnc3NtLWNsdXN0ZXItc2VjdXJpdHlncm91cC1pZCcsIHsgcGFyYW1ldGVyTmFtZTogYCR7U1NNX1BSRUZJWH0vY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkYCwgc3RyaW5nVmFsdWU6IGVjc1NlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==