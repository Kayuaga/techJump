import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31';

interface MyEksClusterStackProps extends cdk.StackProps {
    clusterName: string;
    clusterVersion: eks.KubernetesVersion;
    vpcCidr: string;
    amiReleaseVersion: string;
    // userArn: string;
    tags: { [key: string]: string };
}
export class MyEksAndAuroraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
        super(scope, id, props);

        const { clusterName, clusterVersion, vpcCidr } = props;

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

        const cluster = new eks.Cluster(this, 'EksCluster', {
            clusterName,
            version: clusterVersion,
            vpc,
            defaultCapacity: 0,
            vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
            endpointAccess: eks.EndpointAccess.PUBLIC,
            role: eksRole,
        });

        // Create a Launch Template with IMDSv2 enforcement
        const launchTemplate = new ec2.CfnLaunchTemplate(this, 'NodeLaunchTemplate', {
            launchTemplateData: {
                instanceType: 't3.medium',
                metadataOptions: {
                    httpTokens: 'required',  // Enforce the use of IMDSv2
                },
            },
        });

        // Add managed Node Group using the launch template
        cluster.addNodegroupCapacity('default-node-group', {
            desiredSize: 2,
            maxSize: 3,
            minSize: 1,
            launchTemplateSpec: {
                id: launchTemplate.ref, // Reference the launch template
                version: launchTemplate.attrLatestVersionNumber,
            },
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

        cluster.connections.allowTo(dbSecurityGroup, ec2.Port.tcp(5432));

        const auroraCluster = new rds.DatabaseCluster(this, 'Database', {
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

        cluster.addManifest('DbCredentialsSecret', {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: { name: 'db-credentials' },
            type: 'Opaque',
            data: {
                username: dbSecret.secretValueFromJson('username').toString(),
                password: dbSecret.secretValueFromJson('password').toString(),
                host: Buffer.from(auroraCluster.clusterEndpoint.hostname).toString('base64'),
                port: Buffer.from('5432').toString('base64'),
            },
        });
    }
}