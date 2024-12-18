#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {EcrInfraStack} from '../lib/cdk_infra-stack';
import {MyEksClusterStack} from "../lib/eks_Cluster";

const app = new cdk.App();

new EcrInfraStack(app, 'backendone', {
    repositoryName: `${process.env.REPOSITORY_NAME}-${process.env.PROJECT_NAME}`,
    repoId: process.env.REPOSITORY_ID as string,
});

new EcrInfraStack(app, 'backendtwo', {
    repositoryName: `${process.env.REPOSITORY_NAME}-${process.env.PROJECT_NAME}`,
    repoId: process.env.REPOSITORY_ID as string,
});

new EcrInfraStack(app, 'techjumpapp', {
    repositoryName: `${process.env.REPOSITORY_NAME}-${process.env.PROJECT_NAME}`,
    repoId: process.env.REPOSITORY_ID as string,
});

new MyEksClusterStack(app, 'MyEksClusterStack', {
    clusterName: 'my-eks-cluster',
    clusterVersion: cdk.aws_eks.KubernetesVersion.V1_31,
    vpcCidr: '10.0.0.0/16',
    amiReleaseVersion: 'latest',
    tags: {
        'Environment': 'Dev',
        'Owner': 'Test',
    },
});


app.synth();

//split for each project