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
exports.EcsIamRoleStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const config_1 = require("../../config");
/**
 * This stack is written to share IAM role among multiple-cluster
 *
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html
 *
 * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
 *
 */
class EcsIamRoleStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // AmazonECSTaskExecutionRole based on https://us-east-1.console.aws.amazon.com/iam/home#/policies/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy$jsonEditor
        const taskExecutionRole = new iam.Role(this, 'task-execution-role', {
            roleName: 'AmazonECSFargateTaskExecutionRole',
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
            ]
        });
        const defaultTaskRole = new iam.Role(this, 'default-task-role', {
            roleName: 'ECSFargateDefaultTaskRole',
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess')
            ],
            inlinePolicies: {
                ECSExec: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                "ssmmessages:CreateControlChannel",
                                "ssmmessages:CreateDataChannel",
                                "ssmmessages:OpenControlChannel",
                                "ssmmessages:OpenDataChannel",
                            ],
                            resources: ["*"],
                        }),
                    ],
                }),
            }
        });
        const taskExecRoleParam = new ssm.StringParameter(this, 'ssm-task-execution-role', { parameterName: `${config_1.SSM_PREFIX}/task-execution-role-arn`, stringValue: taskExecutionRole.roleArn });
        const defaultTaskRoleParam = new ssm.StringParameter(this, 'ssm-default-task-role', { parameterName: `${config_1.SSM_PREFIX}/default-task-role-arn`, stringValue: defaultTaskRole.roleArn });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMTaskExecRoleParam', { value: taskExecRoleParam.parameterName });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMTaskExecRoleParamValue', { value: taskExecRoleParam.stringValue });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMDefaultTaskRoleParam', { value: defaultTaskRoleParam.parameterName });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMDefaultTaskRoleParamValue', { value: defaultTaskRoleParam.stringValue });
    }
}
exports.EcsIamRoleStack = EcsIamRoleStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWlhbS1yb2xlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vZWNzLWlhbS1yb2xlL2xpYi9lY3MtaWFtLXJvbGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUEyRDtBQUUzRCx5REFBMkM7QUFDM0MseURBQTJDO0FBRzNDLHlDQUEwQztBQUUxQzs7Ozs7OztHQU9HO0FBQ0gsTUFBYSxlQUFnQixTQUFRLG1CQUFLO0lBQ3hDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsbUxBQW1MO1FBQ25MLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNsRSxRQUFRLEVBQUUsbUNBQW1DO1lBQzdDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQztZQUM5RCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsK0NBQStDLENBQ2hEO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzlELFFBQVEsRUFBRSwyQkFBMkI7WUFDckMsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDO1lBQzlELGVBQWUsRUFBRTtnQkFDZixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUN4Qyx3QkFBd0IsQ0FDekI7Z0JBQ0QsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMseUJBQXlCLENBQzFCO2FBQ0Y7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztvQkFDOUIsVUFBVSxFQUFFO3dCQUNWLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQzs0QkFDdEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSzs0QkFDeEIsT0FBTyxFQUFFO2dDQUNQLGtDQUFrQztnQ0FDbEMsK0JBQStCO2dDQUMvQixnQ0FBZ0M7Z0NBQ2hDLDZCQUE2Qjs2QkFDOUI7NEJBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO3lCQUNqQixDQUFDO3FCQUNIO2lCQUNGLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLG1CQUFVLDBCQUEwQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZMLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLG1CQUFVLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUVwTCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDeEYsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxLQUFLLEVBQUUsb0JBQW9CLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUM5RixJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDbkcsQ0FBQztDQUNGO0FBcERELDBDQW9EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0YWNrLCBTdGFja1Byb3BzLCBDZm5PdXRwdXQgfSBmcm9tICdhd3MtY2RrLWxpYic7XHJcblxyXG5pbXBvcnQgKiBhcyBzc20gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuXHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgeyBTU01fUFJFRklYIH0gZnJvbSAnLi4vLi4vY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBUaGlzIHN0YWNrIGlzIHdyaXR0ZW4gdG8gc2hhcmUgSUFNIHJvbGUgYW1vbmcgbXVsdGlwbGUtY2x1c3RlclxyXG4gKiBcclxuICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FtYXpvbkVDUy9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvdGFzay1pYW0tcm9sZXMuaHRtbFxyXG4gKiBcclxuICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FtYXpvbkVDUy9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvZWNzLWV4ZWMuaHRtbFxyXG4gKiBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBFY3NJYW1Sb2xlU3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBBbWF6b25FQ1NUYXNrRXhlY3V0aW9uUm9sZSBiYXNlZCBvbiBodHRwczovL3VzLWVhc3QtMS5jb25zb2xlLmF3cy5hbWF6b24uY29tL2lhbS9ob21lIy9wb2xpY2llcy9hcm46YXdzOmlhbTo6YXdzOnBvbGljeS9zZXJ2aWNlLXJvbGUvQW1hem9uRUNTVGFza0V4ZWN1dGlvblJvbGVQb2xpY3kkanNvbkVkaXRvclxyXG4gICAgY29uc3QgdGFza0V4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ3Rhc2stZXhlY3V0aW9uLXJvbGUnLCB7XHJcbiAgICAgIHJvbGVOYW1lOiAnQW1hem9uRUNTRmFyZ2F0ZVRhc2tFeGVjdXRpb25Sb2xlJyxcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcclxuICAgICAgICAgICdzZXJ2aWNlLXJvbGUvQW1hem9uRUNTVGFza0V4ZWN1dGlvblJvbGVQb2xpY3knLFxyXG4gICAgICAgICksXHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGRlZmF1bHRUYXNrUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnZGVmYXVsdC10YXNrLXJvbGUnLCB7XHJcbiAgICAgIHJvbGVOYW1lOiAnRUNTRmFyZ2F0ZURlZmF1bHRUYXNrUm9sZScsXHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxyXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcclxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXHJcbiAgICAgICAgICAnQVdTWHJheVdyaXRlT25seUFjY2VzcycsXHJcbiAgICAgICAgKSxcclxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXHJcbiAgICAgICAgICAnQW1hem9uU1NNUmVhZE9ubHlBY2Nlc3MnLFxyXG4gICAgICAgIClcclxuICAgICAgXSxcclxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcclxuICAgICAgICBFQ1NFeGVjOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICBcInNzbW1lc3NhZ2VzOkNyZWF0ZUNvbnRyb2xDaGFubmVsXCIsXHJcbiAgICAgICAgICAgICAgICBcInNzbW1lc3NhZ2VzOkNyZWF0ZURhdGFDaGFubmVsXCIsXHJcbiAgICAgICAgICAgICAgICBcInNzbW1lc3NhZ2VzOk9wZW5Db250cm9sQ2hhbm5lbFwiLFxyXG4gICAgICAgICAgICAgICAgXCJzc21tZXNzYWdlczpPcGVuRGF0YUNoYW5uZWxcIixcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB0YXNrRXhlY1JvbGVQYXJhbSA9IG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tdGFzay1leGVjdXRpb24tcm9sZScsIHsgcGFyYW1ldGVyTmFtZTogYCR7U1NNX1BSRUZJWH0vdGFzay1leGVjdXRpb24tcm9sZS1hcm5gLCBzdHJpbmdWYWx1ZTogdGFza0V4ZWN1dGlvblJvbGUucm9sZUFybiB9KTtcclxuICAgIGNvbnN0IGRlZmF1bHRUYXNrUm9sZVBhcmFtID0gbmV3IHNzbS5TdHJpbmdQYXJhbWV0ZXIodGhpcywgJ3NzbS1kZWZhdWx0LXRhc2stcm9sZScsIHsgcGFyYW1ldGVyTmFtZTogYCR7U1NNX1BSRUZJWH0vZGVmYXVsdC10YXNrLXJvbGUtYXJuYCwgc3RyaW5nVmFsdWU6IGRlZmF1bHRUYXNrUm9sZS5yb2xlQXJuIH0pO1xyXG5cclxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTVRhc2tFeGVjUm9sZVBhcmFtJywgeyB2YWx1ZTogdGFza0V4ZWNSb2xlUGFyYW0ucGFyYW1ldGVyTmFtZSB9KTtcclxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTVRhc2tFeGVjUm9sZVBhcmFtVmFsdWUnLCB7IHZhbHVlOiB0YXNrRXhlY1JvbGVQYXJhbS5zdHJpbmdWYWx1ZSB9KTtcclxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTURlZmF1bHRUYXNrUm9sZVBhcmFtJywgeyB2YWx1ZTogZGVmYXVsdFRhc2tSb2xlUGFyYW0ucGFyYW1ldGVyTmFtZSB9KTtcclxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTURlZmF1bHRUYXNrUm9sZVBhcmFtVmFsdWUnLCB7IHZhbHVlOiBkZWZhdWx0VGFza1JvbGVQYXJhbS5zdHJpbmdWYWx1ZSB9KTtcclxuICB9XHJcbn1cclxuIl19