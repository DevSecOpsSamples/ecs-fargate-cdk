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
exports.VpcStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const config_1 = require("../../config");
class VpcStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const cidr = `10.100.0.0/16`;
        const vpc = new ec2.Vpc(this, 'Vpc', {
            maxAzs: 3,
            natGateways: 3,
            cidr,
            subnetConfiguration: [
                {
                    cidrMask: 20,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 20,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
                }
            ]
        });
        const parameter = new ssm.StringParameter(this, 'SSMVPCID', { parameterName: `${config_1.SSM_PREFIX}/vpc-id`, stringValue: vpc.vpcId });
        new aws_cdk_lib_1.CfnOutput(this, 'VPC', { value: vpc.vpcId });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMParameter', { value: parameter.parameterName });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMParameterValue', { value: vpc.vpcId });
        new aws_cdk_lib_1.CfnOutput(this, 'SSMURL', { value: `https://${this.region}.console.aws.amazon.com/systems-manager/parameters/` });
    }
}
exports.VpcStack = VpcStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdnBjL2xpYi92cGMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUEyRDtBQUczRCx5REFBMkM7QUFDM0MseURBQTJDO0FBRTNDLHlDQUEwQztBQUUxQyxNQUFhLFFBQVMsU0FBUSxtQkFBSztJQUMvQixZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQ3hELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUNqQyxNQUFNLEVBQUUsQ0FBQztZQUNULFdBQVcsRUFBRSxDQUFDO1lBQ2QsSUFBSTtZQUNKLG1CQUFtQixFQUFFO2dCQUNqQjtvQkFDSSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNO2lCQUNwQztnQkFDRDtvQkFDSSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsU0FBUztvQkFDZixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7aUJBQzlDO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLG1CQUFVLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0gsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDakQsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDeEUsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvRCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLElBQUksQ0FBQyxNQUFNLHFEQUFxRCxFQUFFLENBQUMsQ0FBQztJQUMxSCxDQUFDO0NBQ0o7QUE3QkQsNEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMsIENmbk91dHB1dCB9IGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcblxyXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XHJcbmltcG9ydCAqIGFzIHNzbSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3NtJztcclxuXHJcbmltcG9ydCB7IFNTTV9QUkVGSVggfSBmcm9tICcuLi8uLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZwY1N0YWNrIGV4dGVuZHMgU3RhY2sge1xyXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XHJcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNpZHIgPSBgMTAuMTAwLjAuMC8xNmA7XHJcbiAgICAgICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgJ1ZwYycsIHtcclxuICAgICAgICAgICAgbWF4QXpzOiAzLFxyXG4gICAgICAgICAgICBuYXRHYXRld2F5czogMyxcclxuICAgICAgICAgICAgY2lkcixcclxuICAgICAgICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNpZHJNYXNrOiAyMCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAncHVibGljJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNpZHJNYXNrOiAyMCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAncHJpdmF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX05BVCxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJhbWV0ZXIgPSBuZXcgc3NtLlN0cmluZ1BhcmFtZXRlcih0aGlzLCAnU1NNVlBDSUQnLCB7IHBhcmFtZXRlck5hbWU6IGAke1NTTV9QUkVGSVh9L3ZwYy1pZGAsIHN0cmluZ1ZhbHVlOiB2cGMudnBjSWQgfSk7XHJcbiAgICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnVlBDJywgeyB2YWx1ZTogdnBjLnZwY0lkIH0pO1xyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTVBhcmFtZXRlcicsIHsgdmFsdWU6IHBhcmFtZXRlci5wYXJhbWV0ZXJOYW1lIH0pO1xyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTVBhcmFtZXRlclZhbHVlJywgeyB2YWx1ZTogdnBjLnZwY0lkIH0pO1xyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1NTTVVSTCcsIHsgdmFsdWU6IGBodHRwczovLyR7dGhpcy5yZWdpb259LmNvbnNvbGUuYXdzLmFtYXpvbi5jb20vc3lzdGVtcy1tYW5hZ2VyL3BhcmFtZXRlcnMvYCB9KTtcclxuICAgIH1cclxufSJdfQ==