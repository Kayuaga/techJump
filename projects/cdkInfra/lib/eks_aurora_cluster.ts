import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {Construct} from 'constructs';
import {EksClusterConstruct} from "./eskCluster";
import {AuroraCluster} from './auroraCluster'
import {VPCClusterGroup} from "./vpc";
import {SecretValue} from "aws-cdk-lib";

interface MyEksClusterStackProps extends cdk.StackProps {
    clusterName: string;
    clusterVersion: eks.KubernetesVersion;
    vpcCidr: string;
    amiReleaseVersion: string;
    userArn: string;
    tags: { [key: string]: string };
    vpcClusterName: string;
    secretName: string;
    clusterId: string;
    secretId: string;
    securityGroupName: string;
}

export class MyEksAndAuroraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
        super(scope, id, props);

        const {clusterName, userArn, tags, vpcClusterName, secretName, vpcCidr, clusterVersion, clusterId, secretId, securityGroupName} = props;

        const vpc = new VPCClusterGroup(this, vpcClusterName, {
            vpcCidr,
        })

        const eksCluster = new EksClusterConstruct(this, clusterId, {
            vpc: vpc.getVpc(),
            userArn,
            clusterName,
            clusterVersion,
            amiReleaseVersion: 'latest',
            tags,
        })

        const dbSecurityGroup = new ec2.SecurityGroup(this, securityGroupName, {
            vpc: vpc.getVpc(),
            description: 'Allow access to RDS from EKS cluster',
            allowAllOutbound: true,
        });

        const dbSecret = new secretsmanager.Secret(this, secretId, {
            secretName,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({username: 'test'}),
                generateStringKey: 'password',
                excludeCharacters: '"@/\\`',
            },
        });

        eksCluster.getCluster().connections.allowTo(dbSecurityGroup, ec2.Port.tcp(5432));

        new AuroraCluster(this, 'Database', {
            defaultDatabaseName: 'mydatabase',
            vpc: vpc.getVpc(),
            credentials: rds.Credentials.fromSecret(dbSecret),
            securityGroups: [dbSecurityGroup]

        })
    }

}