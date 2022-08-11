
echo "destroy code-pipeline"
cd code-pipeline
cdk destroy

echo "destroy ecs-fargatespot-service-restapi"
cd ../ecs-fargatespot-service-restapi
cdk destroy

echo "destroy ecs-fargate-service-restapi"
cd ../ecs-fargate-service-restapi
cdk destroy

echo "destroy ecs-fargate-cluster"
cd ../ecs-fargate-cluster
cdk destroy

echo "destroy ecs-iam-role"
cd ../ecs-iam-role
cdk destroy

echo "destroy vpc"
cd ../vpc
cdk destroy

find . -name "cdk.out" -exec rm -rf {} \;
find . -name "cdk.context.json" -exec rm -f {} \;