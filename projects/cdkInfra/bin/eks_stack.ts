#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {MyEksClusterStack} from "../lib/eks_Cluster";

const app = new cdk.App();

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
