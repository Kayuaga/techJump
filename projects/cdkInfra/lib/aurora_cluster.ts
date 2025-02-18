import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import {DatabaseCluster} from "aws-cdk-lib/aws-rds";

interface MyEksClusterStackProps extends cdk.StackProps {
    clusterName: string;
    clusterVersion: eks.KubernetesVersion;
    vpcCidr: string;
    amiReleaseVersion: string;
    // userArn: string;
    tags: { [key: string]: string };
}
export class AuroraStack extends cdk.Stack{
    private readonly auroraCluster: DatabaseCluster;
    constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
        super(scope, id, props);

        const {  vpcCidr } = props;

        const vpc = new ec2.Vpc(this, 'Vpc', {
            ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
            maxAzs: 3,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                    mapPublicIpOnLaunch: true,
                },
                {
                    cidrMask: 24,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
            natGateways: 1,
        });

        const eksRole = new iam.Role(this, 'EksRole', {
            assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController'),
            ],
        });

        const dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'postgres' }),
                generateStringKey: 'password',
                passwordLength: 16,
            },
        });

        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
            vpc,
            description: 'Allow access to RDS from EKS cluster',
            allowAllOutbound: true,
        });

        this.auroraCluster = new rds.DatabaseCluster(this, 'Database', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_14_5 }),
            defaultDatabaseName: 'mydatabase',
            instances: 2,
            credentials: rds.Credentials.fromSecret(dbSecret),
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [dbSecurityGroup],
        });
    }

    getAuroraCluster():DatabaseCluster {
            return this.auroraCluster;
    }
}