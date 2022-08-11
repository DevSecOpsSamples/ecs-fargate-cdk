find . -name "cdk.context.json" -exec rm -f {} \;

echo "Deploy vpc"

cd ./vpc
cdk deploy --require-approval never


echo "Deploy ecs-fargate-cluster"

cd ../ecs-fargate-cluster
cdk deploy --require-approval never


echo "Deploy ecs-iam-role"

cd ../ecs-iam-role
cdk deploy --require-approval never

echo "Deploy ecr-codecommit"

cd ../ecr-codecommit
cdk deploy --require-approval never --outputs-file ./cdk-outputs.json
cat ./cdk-outputs.json 


echo "Deploy ecs-fargate-service-restapi"

cd ../ecs-fargate-service-restapi
cdk deploy --require-approval never


echo "Deploy ecs-fargatespot-service-restapi"

cd ../ecs-fargatespot-service-restapi
cdk deploy --require-approval never

echo "Deploy code-pipeline"

cd ../code-pipeline
cdk deploy --require-approval never
