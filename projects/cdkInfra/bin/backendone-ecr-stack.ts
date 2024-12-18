#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {EcrInfraStack} from '../lib/cdk_infra-stack';
import {MyEksClusterStack} from "../lib/eks_Cluster";

const app = new cdk.App();

new EcrInfraStack(app, 'backendone', {
    repositoryName: `${process.env.REPOSITORY_NAME}-${process.env.PROJECT_NAME}`,
    repoId: process.env.REPOSITORY_ID as string,
});

app.synth();

//split for each project