import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface CdkInfraStackProps extends cdk.StackProps {
  repositoryName: string
  repoId: string
}

export class EcrInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkInfraStackProps  ) {
    super(scope, id, props);
    console.log('in constructor', props.repoId)
    console.log(props.repositoryName)
    new cdk.aws_ecr.Repository(this, props.repoId, {
      repositoryName: props.repositoryName,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Automatically delete when stack is deleted
    })

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkInfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
