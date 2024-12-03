#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {EcrInfraStack} from '../lib/cdk_infra-stack';

const app = new cdk.App();

new EcrInfraStack(app, process.env.ECR_ID as string, {
    repositoryName: `${process.env.REPOSITORY_NAME}_${process.env.PROJECT_NAME}`,
    repoId: process.env.REPOSITORY_ID as string,
});