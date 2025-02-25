#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {MyEksAndAuroraStack} from '../lib/eks_aurora_cluster'

const app = new cdk.App();

new MyEksAndAuroraStack(app, 'MyEksAuroraClusterStack', {
    clusterName: 'my-eks-aurora-cluster',
    clusterId: 'my-eks-aurora-cluster',
    clusterVersion: cdk.aws_eks.KubernetesVersion.V1_31,
    vpcCidr: '10.0.0.0/16',
    amiReleaseVersion: 'latest',
    userArn: 'arn:aws:iam::803269230183:user/testTerraform',
    tags: {
        'Environment': 'Dev',
        'Owner': 'Test',
    },
    vpcClusterName:'eks-aurora-vpc',
    secretName: "eks-aurora-secret",
    secretId: "eks-aurora-secret-id",
    securityGroupName: "eks-aurora-security-group",
});


app.synth();
