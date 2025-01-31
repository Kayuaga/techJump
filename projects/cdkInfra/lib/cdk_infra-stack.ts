import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

interface CdkInfraStackProps extends cdk.StackProps {
  repositoryName: string
  repoId: string
}
export class EcrInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkInfraStackProps) {
    super(scope, id, props);

    new ecr.Repository(this, props.repoId, {
      emptyOnDelete: true,
      repositoryName: props.repositoryName,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Automatically delete the repository when stack is deleted
      lifecycleRules: [
        {
          description: 'Retain only the last 10 images',
          rulePriority: 1,
          maxImageCount: 10,
        },
        {
          description: 'Expire untagged images older than 30 days',
          rulePriority: 2,
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: cdk.Duration.days(30),
        },
      ],
    });
  }
}
