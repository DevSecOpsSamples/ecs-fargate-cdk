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
exports.EcrCodeCommitStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const path = __importStar(require("path"));
const codecommit = __importStar(require("aws-cdk-lib/aws-codecommit"));
const ssm = __importStar(require("aws-cdk-lib/aws-ssm"));
const ecr = __importStar(require("aws-cdk-lib/aws-ecr"));
const assets = __importStar(require("aws-cdk-lib/aws-ecr-assets"));
const ecrdeploy = __importStar(require("cdk-ecr-deployment"));
const config_1 = require("../../config");
/**
 * Build 'app/Dockerfile' and push to ECR for X86 and ARM
 */
class EcrCodeCommitStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
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
        aws_cdk_lib_1.Tags.of(codecommitRepo).add('Stage', stage);
        aws_cdk_lib_1.Tags.of(ecrRepo).add('Stage', stage);
        aws_cdk_lib_1.Tags.of(ecrArmRepo).add('Stage', stage);
        new aws_cdk_lib_1.CfnOutput(this, 'URI', { value: ecrRepo.repositoryUri });
        new aws_cdk_lib_1.CfnOutput(this, 'URIARM', { value: ecrArmRepo.repositoryUri });
        new ssm.StringParameter(this, 'ssm-codecommit-arn', { parameterName: `${config_1.SSM_PREFIX}/codecommit-arn`, stringValue: codecommitRepo.repositoryArn });
        new ssm.StringParameter(this, 'ssm-ecr-repo-name', { parameterName: `${config_1.SSM_PREFIX}/ecr-repo-name`, stringValue: ecrRepo.repositoryName });
        new ssm.StringParameter(this, 'ssm-ecr-repo-arn', { parameterName: `${config_1.SSM_PREFIX}/ecr-repo-arn`, stringValue: ecrRepo.repositoryArn });
        new ssm.StringParameter(this, 'ssm-ecr-armrepo-name', { parameterName: `${config_1.SSM_PREFIX}/ecr-armrepo-name`, stringValue: ecrArmRepo.repositoryUri });
        new ssm.StringParameter(this, 'ssm-ecr-armrepo-arn', { parameterName: `${config_1.SSM_PREFIX}/ecr-armrepo-arn`, stringValue: ecrArmRepo.repositoryArn });
        new aws_cdk_lib_1.CfnOutput(this, 'CodeCommitRepoUrl', { value: codecommitRepo.repositoryCloneUrlHttp });
    }
}
exports.EcrCodeCommitStack = EcrCodeCommitStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNyLWNvZGVjb21taXQtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9lY3ItY29kZWNvbW1pdC9saWIvZWNyLWNvZGVjb21taXQtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDZDQUFxRDtBQUNyRCwyQ0FBNkI7QUFDN0IsdUVBQXlEO0FBQ3pELHlEQUEyQztBQUMzQyx5REFBMkM7QUFDM0MsbUVBQXFEO0FBQ3JELDhEQUFnRDtBQUVoRCx5Q0FBNEQ7QUFLNUQ7O0dBRUc7QUFDSCxNQUFhLGtCQUFtQixTQUFRLG1CQUFLO0lBQ3pDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBb0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBRXRDLE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDaEUsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUM7U0FDbkQsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLFdBQVcsRUFBRSxFQUFFO1lBQ3ZELGNBQWMsRUFBRSxHQUFHLFdBQVcsRUFBRTtTQUNuQyxDQUFDLENBQUM7UUFDSCxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2hELEdBQUcsRUFBRSxJQUFJLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNyRCxJQUFJLEVBQUUsSUFBSSxTQUFTLENB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LENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKO0FBbERELGdEQWtEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgeyBTdGFjaywgQ2ZuT3V0cHV0LCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBjb2RlY29tbWl0IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlY29tbWl0JztcclxuaW1wb3J0ICogYXMgc3NtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zc20nO1xyXG5pbXBvcnQgKiBhcyBlY3IgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcic7XHJcbmltcG9ydCAqIGFzIGFzc2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyLWFzc2V0cyc7XHJcbmltcG9ydCAqIGFzIGVjcmRlcGxveSBmcm9tICdjZGstZWNyLWRlcGxveW1lbnQnO1xyXG5cclxuaW1wb3J0IHsgU3RhY2tDb21tb25Qcm9wcywgU1NNX1BSRUZJWCB9IGZyb20gJy4uLy4uL2NvbmZpZyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVjclN0YWNrUHJvcHMgZXh0ZW5kcyBTdGFja0NvbW1vblByb3BzIHtcclxuICAgIHNlcnZpY2VOYW1lOiBzdHJpbmc7XHJcbn1cclxuLyoqXHJcbiAqIEJ1aWxkICdhcHAvRG9ja2VyZmlsZScgYW5kIHB1c2ggdG8gRUNSIGZvciBYODYgYW5kIEFSTVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEVjckNvZGVDb21taXRTdGFjayBleHRlbmRzIFN0YWNrIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFY3JTdGFja1Byb3BzKSB7XHJcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YWdlID0gcHJvcHMuc3RhZ2U7XHJcbiAgICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBwcm9wcy5zZXJ2aWNlTmFtZTtcclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRYODYgPSBuZXcgYXNzZXRzLkRvY2tlckltYWdlQXNzZXQodGhpcywgJ2Vjci1pbWFnZS14ODYnLCB7XHJcbiAgICAgICAgICAgIGRpcmVjdG9yeTogcGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9cIiwgXCJhcHBcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBlY3JSZXBvID0gbmV3IGVjci5SZXBvc2l0b3J5KHRoaXMsIGAke3NlcnZpY2VOYW1lfWAsIHtcclxuICAgICAgICAgICAgcmVwb3NpdG9yeU5hbWU6IGAke3NlcnZpY2VOYW1lfWBcclxuICAgICAgICB9KTtcclxuICAgICAgICBuZXcgZWNyZGVwbG95LkVDUkRlcGxveW1lbnQodGhpcywgJ2Vjci1kZXBsb3kteDg2Jywge1xyXG4gICAgICAgICAgICBzcmM6IG5ldyBlY3JkZXBsb3kuRG9ja2VySW1hZ2VOYW1lKGFzc2V0WDg2LmltYWdlVXJpKSxcclxuICAgICAgICAgICAgZGVzdDogbmV3IGVjcmRlcGxveS5Eb2NrZXJJbWFnZU5hbWUoYCR7ZWNyUmVwby5yZXBvc2l0b3J5VXJpRm9yVGFnKCdsYXRlc3QnKX1gKSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRBcm0gPSBuZXcgYXNzZXRzLkRvY2tlckltYWdlQXNzZXQodGhpcywgJ2Vjci1pbWFnZS1hcm0nLCB7XHJcbiAgICAgICAgICAgIGRpcmVjdG9yeTogcGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9cIiwgXCJhcHBcIiksXHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiBhc3NldHMuUGxhdGZvcm0uTElOVVhfQVJNNjQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgZWNyQXJtUmVwbyA9IG5ldyBlY3IuUmVwb3NpdG9yeSh0aGlzLCBgJHtzZXJ2aWNlTmFtZX0tYXJtYCwge1xyXG4gICAgICAgICAgICByZXBvc2l0b3J5TmFtZTogYCR7c2VydmljZU5hbWV9LWFybWBcclxuICAgICAgICB9KTtcclxuICAgICAgICBuZXcgZWNyZGVwbG95LkVDUkRlcGxveW1lbnQodGhpcywgJ2Vjci1kZXBsb3ktYXJtJywge1xyXG4gICAgICAgICAgICBzcmM6IG5ldyBlY3JkZXBsb3kuRG9ja2VySW1hZ2VOYW1lKGFzc2V0QXJtLmltYWdlVXJpKSxcclxuICAgICAgICAgICAgZGVzdDogbmV3IGVjcmRlcGxveS5Eb2NrZXJJbWFnZU5hbWUoYCR7ZWNyQXJtUmVwby5yZXBvc2l0b3J5VXJpRm9yVGFnKCdsYXRlc3QnKX1gKSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgY29kZWNvbW1pdFJlcG8gPSBuZXcgY29kZWNvbW1pdC5SZXBvc2l0b3J5KHRoaXMsIGAke3NlcnZpY2VOYW1lfS1jb2RlY29tbWl0YCwge1xyXG4gICAgICAgICAgICByZXBvc2l0b3J5TmFtZTogYCR7c2VydmljZU5hbWV9YFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBUYWdzLm9mKGNvZGVjb21taXRSZXBvKS5hZGQoJ1N0YWdlJywgc3RhZ2UpO1xyXG4gICAgICAgIFRhZ3Mub2YoZWNyUmVwbykuYWRkKCdTdGFnZScsIHN0YWdlKTtcclxuICAgICAgICBUYWdzLm9mKGVjckFybVJlcG8pLmFkZCgnU3RhZ2UnLCBzdGFnZSk7XHJcblxyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1VSSScsIHsgdmFsdWU6IGVjclJlcG8ucmVwb3NpdG9yeVVyaSB9KTtcclxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdVUklBUk0nLCB7IHZhbHVlOiBlY3JBcm1SZXBvLnJlcG9zaXRvcnlVcmkgfSk7XHJcblxyXG4gICAgICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tY29kZWNvbW1pdC1hcm4nLCB7IHBhcmFtZXRlck5hbWU6IGAke1NTTV9QUkVGSVh9L2NvZGVjb21taXQtYXJuYCwgc3RyaW5nVmFsdWU6IGNvZGVjb21taXRSZXBvLnJlcG9zaXRvcnlBcm4gfSk7XHJcblxyXG4gICAgICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tZWNyLXJlcG8tbmFtZScsIHsgcGFyYW1ldGVyTmFtZTogYCR7U1NNX1BSRUZJWH0vZWNyLXJlcG8tbmFtZWAsIHN0cmluZ1ZhbHVlOiBlY3JSZXBvLnJlcG9zaXRvcnlOYW1lIH0pO1xyXG4gICAgICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tZWNyLXJlcG8tYXJuJywgeyBwYXJhbWV0ZXJOYW1lOiBgJHtTU01fUFJFRklYfS9lY3ItcmVwby1hcm5gLCBzdHJpbmdWYWx1ZTogZWNyUmVwby5yZXBvc2l0b3J5QXJuIH0pO1xyXG4gICAgICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsICdzc20tZWNyLWFybXJlcG8tbmFtZScsIHsgcGFyYW1ldGVyTmFtZTogYCR7U1NNX1BSRUZJWH0vZWNyLWFybXJlcG8tbmFtZWAsIHN0cmluZ1ZhbHVlOiBlY3JBcm1SZXBvLnJlcG9zaXRvcnlVcmkgfSk7XHJcbiAgICAgICAgbmV3IHNzbS5TdHJpbmdQYXJhbWV0ZXIodGhpcywgJ3NzbS1lY3ItYXJtcmVwby1hcm4nLCB7IHBhcmFtZXRlck5hbWU6IGAke1NTTV9QUkVGSVh9L2Vjci1hcm1yZXBvLWFybmAsIHN0cmluZ1ZhbHVlOiBlY3JBcm1SZXBvLnJlcG9zaXRvcnlBcm4gfSk7XHJcblxyXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NvZGVDb21taXRSZXBvVXJsJywgeyB2YWx1ZTogY29kZWNvbW1pdFJlcG8ucmVwb3NpdG9yeUNsb25lVXJsSHR0cCB9KTtcclxuICAgIH1cclxufVxyXG4iXX0=