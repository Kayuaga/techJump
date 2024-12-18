import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31';

interface MyEksClusterStackProps extends cdk.StackProps {
  clusterName: string;
  clusterVersion: eks.KubernetesVersion;
  vpcCidr: string;
  amiReleaseVersion: string;
  // userArn: string;
  tags: { [key: string]: string };
}

export class MyEksClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
    super(scope, id, props);

    const { clusterName, clusterVersion, vpcCidr, amiReleaseVersion, tags } = props;

    // Update VPC creation to use ipAddresses instead of cidr
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      maxAzs: 3,  // Limit to three Availability Zones
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
      natGateways: 1,  // Set to have a single NAT Gateway
    });

    // Tag public subnets
    vpc.publicSubnets.forEach(subnet => {
      cdk.Tags.of(subnet).add('kubernetes.io/role/elb', '1');
      Object.entries(tags).forEach(([key, value]) => {
        cdk.Tags.of(subnet).add(key, value);
      });
    });

    // Tag private subnets
    vpc.privateSubnets.forEach(subnet => {
      cdk.Tags.of(subnet).add('kubernetes.io/role/internal-elb', '1');
      cdk.Tags.of(subnet).add('karpenter.sh/discovery', clusterName);
      Object.entries(tags).forEach(([key, value]) => {
        cdk.Tags.of(subnet).add(key, value);
      });
    });

    // IAM Role for the EKS cluster
    const eksRole = new iam.Role(this, 'EksRole', {
      assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController'),
      ],
    });

    // Create the EKS Cluster
    const cluster = new eks.Cluster(this, 'EksCluster', {
      clusterName,
      version: clusterVersion,
      vpc,
      defaultCapacity: 0,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      endpointAccess: eks.EndpointAccess.PUBLIC,
      role: eksRole,
      kubectlLayer: new KubectlV31Layer(this, 'kubectl'),
    });

    // Add a managed node group
    const nodeGroup = cluster.addNodegroupCapacity('default-node-group', {
      instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL)],
      minSize: 1,
      maxSize: 2,
      desiredSize: 1,
      forceUpdate: true,
      labels: {
        'monorepo-techjump': 'yes',
      },
    });

    nodeGroup.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));
    cluster.awsAuth.addUserMapping(iam.User.fromUserArn(this, 'User', 'arn:aws:iam::803269230183:user/testTerraform'), {
      username: 'cluster-admin',
      groups: ['system:masters'],
    });

    // IAM Role for cluster admin
    const clusterAdminRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });
    cluster.awsAuth.addMastersRole(clusterAdminRole);
  }
}