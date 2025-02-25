import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import {DatabaseCluster} from "aws-cdk-lib/aws-rds";

interface MyEksClusterStackProps extends cdk.StackProps {
    tags?: { [key: string]: string };
    vpc: any,
    securityGroups: any[],
    credentials: any,
    defaultDatabaseName: string
}

export class AuroraCluster extends Construct {
    private readonly auroraCluster: DatabaseCluster;
    constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
        super(scope, id);

        const { vpc, securityGroups, credentials,defaultDatabaseName } = props;

        new rds.DatabaseCluster(this, id, {
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_16_4 }),
            defaultDatabaseName,
            writer: rds.ClusterInstance.provisioned('writer', {
                publiclyAccessible: false,
            }),
            readers: [
                rds.ClusterInstance.provisioned('reader1', {
                    promotionTier: 1,
                }),
                rds.ClusterInstance.serverlessV2('reader2'),
            ],

            credentials,
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups,
        });
    }

    getAuroraCluster():DatabaseCluster {
            return this.auroraCluster;
    }
}