# ECS Fargate with CDK

[![Build](https://github.com/DevSecOpsSamples/ecs-fargate-cdk/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/DevSecOpsSamples/ecs-fargate-cdk/actions/workflows/build.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DevSecOpsSamples_ecs-fargate-cdk&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DevSecOpsSamples_ecs-fargate-cdk) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DevSecOpsSamples_ecs-fargate-cdk&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=DevSecOpsSamples_ecs-fargate-cdk)

## Overview

In this sample project, we will learn major features of ECS Fargate/Fargate Spot and deployment with AWS Code Pipeline.

![Architecture](./screenshots/fargate-architecture.png?raw=true)

## Objectives

Learn the features below using the CDK code:

* ECS Cluster, Service, and Task
* ECS Task IAM role
* ECS Fargate and Fargate Spot with Capacity Prodiver
* ECS AutoScaling with Target Tracking Scaling
* ECS Exec to execute a command
* ECS deployment with X-Ray sidecar
* ECS deployment with AWS Code Commit repository and AWS Code Pipeline

## Table of Contents

1. Deploy VPC stack
2. Deploy ECS Fargate cluster stack
3. Deploy IAM Role stack
4. Docker build, deploy ECR and CodeCommit repository stack
5. Deploy ECS Fargate Service stack
6. Deploy ECS FargateSpot Service stack
7. Scale the ECS Tasks
8. Execute a command using ECS Exec
9. Deploy ECS Code Pipeline stack

## Prerequisites

```bash
npm install -g aws-cdk@2.32.1
npm install -g cdk-ecr-deployment@2.5.5

# install packages in the root folder
npm install
cdk bootstrap
```

Use the `cdk` command-line toolkit to interact with your project:

* `cdk deploy`: deploys your app into an AWS account
* `cdk synth`: synthesizes an AWS CloudFormation template for your app
* `cdk diff`: compares your app with the deployed stack
* `cdk watch`: deployment every time a file change is detected

## CDK Stack

|   | Stack                            |  Time To Complete |
|---|----------------------------------|-------------------|
| 1 | VPC                              | 3m 30s (optional)     |
| 2 | ECS Fargate cluster              | 50s     |
| 3 | IAM roles                        | 1m      |
| 4 | ECR and CodeCommit repository    | 2m      |
| 5 | ECS Fargate Service and ALB      | 3m      |
| 6 | ECS FargateSpot Service and ALB  | 3m      |
| 7 | Code Pipeline                    | 1m      |
|   | Total                            | 11m (14m 30s with a new VPC) |

## Steps

Use the [deploy-all.sh](./deploy-all.sh) file if you want to deploy all stacks without prompt at a time.

### Step 1: VPC

Deploy a new VPC:

```bash
cd vpc
cdk deploy
```

[vpc/lib/vpc-stack.ts](./vpc/lib/vpc-stack.ts)

The VPC ID will be saved into the SSM Parameter Store(`/cdk-ecs-fargate/vpc-id`) to refer from other stacks.

To use the existing VPC, use the `-c vpcId` context parameter or create SSM Parameter:

```bash
aws ssm put-parameter --name "/cdk-ecs-fargate/vpc-id" --value "{existing-vpc-id}" --type String 
```

### Step 2: ECS cluster

```bash
cd ../ecs-fargate-cluster
cdk deploy 

# or define your VPC id with context parameter
cdk deploy -c vpcId=<vpc-id>
```

SSM parameter:

* /cdk-ecs-fargate/vpc-id

Cluster Name: [ecs-fargate-cluster/lib/cluster-config.ts](./ecs-fargate-cluster/lib/cluster-config.ts)

[ecs-fargate-cluster/lib/ecs-fargate-cluster-stack.ts](./ecs-fargate-cluster/lib/ecs-fargate-cluster-stack.ts)

### Step 3: IAM Role

Create the ECS Task Execution role and default Task Role.

* AmazonECSFargateTaskExecutionRole
* ECSFargateDefaultTaskRole including a policy for ECS Exec

```bash
cd ../iam-role
cdk deploy 
```

[ecs-iam-role/lib/ecs-iam-role-stack.ts](./ecs-iam-role/lib/ecs-iam-role-stack.ts)

### Step 4: ECR and CodeCommit repository

```bash
cd ../ecr-codecommit
cdk deploy --outputs-file ./cdk-outputs.json
cat ./cdk-outputs.json 
```

[ecr-codecommit/lib/ecr-codecommit-stack.ts](./ecr-codecommit/lib/ecr-codecommit-stack.ts)

### Step 5: ECS Service

Crearte a Fargate Service, Auto Scaling, ALB, and Log Group.

```bash
cd ../ecs-restapi-service
cdk deploy 
```

ecs-restapi-service refers the SSM parameters below:

* /cdk-ecs-fargate/vpc-id
* /cdk-ecs-fargate/cluster-securitygroup-id
* /cdk-ecs-fargate/task-execution-role-arn
* /cdk-ecs-fargate/default-task-role-arn

[ecs-fargate-service-restapi/lib/ecs-fargate-service-restapi-stack.ts](./ecs-fargate-service-restapi/lib/ecs-fargate-service-restapi-stack.ts)

#### Configuration for Staging and Production

| Resource      | Property           | Value       |
|---------------|--------------------|-------------|
| ECS Service   | minHealthyPercent  | 100         |
| ECS Service   | maxHealthyPercent  | 200         |
| ECS Service   | scaleOutCooldown   | 60 seconds  |
| ECS Service   | scaleInCooldown    | 120 seconds |
| ALB           | idleTimeout        | 30 seconds  |
| ALB TargetGroup      | healthyThresholdCount    | 2  |
| ALB TargetGroup      | unhealthyThresholdCount  | 5  |
| ALB TargetGroup      | interval                 | 31 seconds  |
| ALB TargetGroup      | timeout                  | 30 seconds  |
| ALB TargetGroup      | deregistrationDelay      | 15 seconds  |

**IMPORTANT**

If the ECS cluster was re-created, you HAVE to deploy after cdk.context.json files deletion with the below:

`find . -name "cdk.context.json" -exec rm -f {} \;`

### Step 6: ECS Service with Fargate Spot

Crearte a Fargate Service with `Spot CapacityProvider`, Auto Scaling, ALB, and Log Group.

```bash
cd ../ecs-fargatespot-service-restapi
cdk deploy 
```

Use FARGATE_SPOT as 50% ratio:

```typescript
const fargateService = new ecs.FargateService(this, 'ecs-fargate-service', {
    cluster,
    serviceName,
    taskDefinition,
    enableExecuteCommand: true,
    minHealthyPercent: 100,
    maxHealthyPercent: 200,
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
```

[ecs-fargatespot-service-restapi/lib/ecs-fargatespot-service-restapi-stack.ts](./ecs-fargatespot-service-restapi/lib/ecs-fargatespot-service-restapi-stack.ts)

![ecs-service](./screenshots/ecs-service.png?raw=true)

![spot-task](./screenshots/spot-task.png?raw=true)

### Step 7: Scale the Tasks

```bash
aws ecs update-service --cluster fargate-dev --service fargate-restapi-dev --desired-count 10

aws ecs update-service --cluster fargate-dev --service fargatespot-restapi-dev --desired-count 10
```

### Step 8: Execute a command using ECS Exec

Install the Session Manager plugin for the AWS CLI:

https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html#install-plugin-linux

```bash
aws ecs list-tasks --cluster fargate-dev --service-name restapi
```

```json
{
    "taskArns": [
        "arn:aws:ecs:us-east-1:123456789:task/fargate-dev/0a244ff8b8654b3abaaed0880b2b78f1",
        "arn:aws:ecs:us-east-1:123456789:task/fargate-dev/ac3d5a4e7273460a80aa18264e4a8f5e"
    ]
}
```

```bash
TASK_ID=$(aws ecs list-tasks --cluster fargate-dev --service-name restapi | jq '.taskArns[0]' | cut -d '/' -f3 | cut -d '"' -f1)

aws ecs execute-command --cluster fargate-dev --task $TASK_ID --container restapi-container  --interactive --command "/bin/sh"
```

```bash
The Session Manager plugin was installed successfully. Use the AWS CLI to start a session.

Starting session with SessionId: ecs-execute-command-0dfcb1f8c2e47585a
/app # top
Mem: 1253428K used, 6610268K free, 540K shrd, 2088K buff, 827656K cached
CPU:   0% usr   0% sys   0% nic 100% idle   0% io   0% irq   0% sirq
Load average: 0.00 0.02 0.00 4/301 75
  PID  PPID USER     STAT   VSZ %VSZ CPU %CPU COMMAND
   22     8 root     S    1525m  19%   2   0% /ecs-execute-command-2daf7b7a-7ad7-457d-a33d-ca639508cfa7/ssm-agent-worker
   57    22 root     S    1518m  19%   2   0% /ecs-execute-command-2daf7b7a-7ad7-457d-a33d-ca639508cfa7/ssm-session-worker ecs-execute-command-0dfcb1f8c2e47585a
    8     0 root     S    1440m  18%   1   0% /ecs-execute-command-2daf7b7a-7ad7-457d-a33d-ca639508cfa7/amazon-ssm-agent
   14     1 root     S    32632   0%   2   0% {gunicorn} /usr/local/bin/python /usr/local/bin/gunicorn flask_api:app --bind 0.0.0.0:8080
    1     0 root     S    22976   0%   0   0% {gunicorn} /usr/local/bin/python /usr/local/bin/gunicorn flask_api:app --bind 0.0.0.0:8080
   66    57 root     S     1676   0%   0   0% /bin/sh
   74    66 root     R     1604   0%   1   0% top
/app # exit
```

### Step 9: ECS deploy with Code Pipeline

Commit ./app folder files to your new Code Commit repository:

```bash
PROJECT_ROOT=$(pwd)
echo $PROJECT_ROOT

CODECOMMIT_REPO_URL=$(cat ecr-codecommit/cdk-outputs.json | jq '."ecr-fargate-restapi-dev".CodeCommitRepoUrl'| cut -d '"' -f2)
echo $CODECOMMIT_REPO_URL
cd ../
git clone ${CODECOMMIT_REPO_URL}
CODECOMMIT_ROOT=$(pwd)/fargate-restapi-dev

cp ${PROJECT_ROOT}/app/* ${CODECOMMIT_ROOT}/
cd ${CODECOMMIT_ROOT}
git add .
git commit -m "code pipeline"
git push 
```

Create a GitHub token on `Settings >  Developer settings` menu and create a secret:

https://github.com/settings/tokens

```bash
aws secretsmanager create-secret --name '/github/token' --secret-string {your-token}

cd ../code-pipeline
cdk deploy 
```

SSM parameters:

* /cdk-ecs-fargate/ecr-repo-arn
* /cdk-ecs-fargate/ecr-repo-name
* /cdk-ecs-fargate/cluster-securitygroup-id
* /cdk-ecs-fargate/cluster-name
* /cdk-ecs-fargate/codecommit-arn

[code-pipeline/lib/ecs-codedeploy-stack.ts](./code-pipeline/lib/ecs-codedeploy-stack.ts)

## Clean Up

[clean-up.sh](./clean-up.sh)

## Structure

```text
├── build.gradle
├── package.json
├── ssm-prefix.ts
├── tsconfig.json
├── vpc
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   └── lib
│       └── vpc-stack.ts
├── ecs-fargate-cluster
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   ├── cluster-config.ts
│   │   └── ec2ecs-cluster-stack.ts
│   └── settings.yaml
├── ecs-iam-role
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   └── lib
│       └── ecs-iam-role-stack.ts
├── ecs-fargate-service-restapi
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   └── ecs-fargate-service-restapi-stack.ts
├── ecs-fargatespot-service-restapi
│   ├── bin
│   │   └── index.ts
│   ├── cdk.json
│   ├── lib
│   │   └── ecs-fargatespot-service-restapi-stack.ts
├── app
│   ├── Dockerfile
│   ├── README.md
│   ├── build.sh
│   ├── flask_api.py
│   ├── gunicorn.config.py
│   └── requirements.txt
```

## Reference

* [GitHub - aws-containers](https://github.com/aws-containers)

### Docs

* [Fargate Task Networking](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/userguide/fargate-task-networking.html) for debugging

* [ECS Exec](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html) for debugging

### CDK Lib

* [ECS](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs-readme.html)

* [ECR Assets](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr_assets-readme.html)

* [IAM](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam-readme.html)

* [SSM](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ssm-readme.html)

### IAM Role & Policy

* [Task Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)

* [Exec Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html)
