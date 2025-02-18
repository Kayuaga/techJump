import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

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

export class MyEksClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
    super(scope, id, props);

    const { clusterName, clusterVersion, vpcCidr, tags } = props;

    // Create the VPC for EKS
    const vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: vpcCidr,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'public',
          cidrMask: 24,
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
        {
          name: 'private',
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
      natGateways: 1,
    });

    // Define IAM policy statements
    const policyStatements = [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ec2:CreateSnapshot",
          "ec2:AttachVolume",
          "ec2:DetachVolume",
          "ec2:ModifyVolume",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeInstances",
          "ec2:DescribeSnapshots",
          "ec2:DescribeTags",
          "ec2:DescribeVolumes",
          "ec2:DescribeVolumesModifications",
        ],
        resources: ["*"],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:CreateTags"],
        resources: [
          "arn:aws:ec2:*:*:volume/*",
          "arn:aws:ec2:*:*:snapshot/*",
        ],
        conditions: {
          StringEquals: {
            "ec2:CreateAction": ["CreateVolume", "CreateSnapshot"]
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteTags"],
        resources: [
          "arn:aws:ec2:*:*:volume/*",
          "arn:aws:ec2:*:*:snapshot/*",
        ],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:CreateVolume"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "aws:RequestTag/ebs.csi.aws.com/cluster": "true"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:CreateVolume"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "aws:RequestTag/CSIVolumeName": "*"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteVolume"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteVolume"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "ec2:ResourceTag/CSIVolumeName": "*"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteVolume"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "ec2:ResourceTag/kubernetes.io/created-for/pvc/name": "*"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteSnapshot"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "ec2:ResourceTag/CSIVolumeSnapshotName": "*"
          }
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ec2:DeleteSnapshot"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true"
          }
        },
      }),
    ];

    // IAM Role for the EBS CSI controller
    const ebsCsiRole = new iam.Role(this, 'EbsCsiControllerRole', {
      assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
    });

    // Create an IAM policy and attach it to the role
    const policy = new iam.Policy(this, 'EbsCsiControllerPolicy', {
      statements: policyStatements,
    });
    policy.attachToRole(ebsCsiRole);
    const eksRole = new iam.Role(this, 'EksRole', {
      assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy'),
      ],
    });

    // Create the EKS Cluster
    const cluster = new eks.Cluster(this, 'EksCluster', {
      clusterName,
      version: clusterVersion,
      vpc,
      defaultCapacity: 0,
      role: eksRole,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
    });

    // Create a Kubernetes Service Account for EBS CSI Driver
    const ebsCsiServiceAccount = cluster.addServiceAccount(
        'EbsCsiControllerSa',
        {
          name: 'ebs-csi-controller-sa',
          namespace: 'kube-system',
        }
    );

    // Attach the role to the service account
    ebsCsiServiceAccount.role.attachInlinePolicy(
        new iam.Policy(this, 'EbsCsiServiceAccountPolicy', {
          statements: policyStatements,
        })
    );

    // Deploy the EBS CSI Driver using Helm
    cluster.addHelmChart('aws-ebs-csi-driver', {
      chart: 'aws-ebs-csi-driver',
      release: 'aws-ebs-csi-driver',
      repository: 'https://kubernetes-sigs.github.io/aws-ebs-csi-driver',
      namespace: 'kube-system',
      values: {
        controller: {
          serviceAccount: {
            create: false,
            name: ebsCsiServiceAccount.serviceAccountName,
          },
        },
      },
    });

    // Additional NodeGroup setup if needed
    const nodeGroupRole = new iam.Role(this, 'NodeGroupRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
      ],
    });

    cluster.awsAuth.addUserMapping(iam.User.fromUserArn(this, 'User', 'arn:aws:iam::803269230183:user/testTerraform'), {
      username: 'cluster-admin',
      groups: ['system:masters'],
    });

    // Adding Cluster Admin Role
    const clusterAdminRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });
    cluster.awsAuth.addMastersRole(clusterAdminRole);

    // NodeGroup
    const nodeGroup = cluster.addNodegroupCapacity('default-node-group', {
      minSize: 2,
      maxSize: 5,
      desiredSize: 3,
      instanceTypes: [new ec2.InstanceType('t3.small')],
      nodeRole: nodeGroupRole,
    });
    nodeGroup.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));

    // Example of Kubernetes YAML for Load Balancer
    // Note: This should be preferably in a Helm chart or a manifest file
    new eks.KubernetesManifest(this, 'LoadBalancerService', {
      cluster,
      manifest: [
        {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: {
            name: 'my-service',
            namespace: 'default',
          },
          spec: {
            type: 'LoadBalancer',
            selector: {
              app: 'my-app',
            },
            ports: [
              {
                protocol: 'TCP',
                port: 80,
                targetPort: 8080,
              },
            ],
          },
        },
      ],
    });
  }
}