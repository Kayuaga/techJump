import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

interface MyEksClusterStackProps extends cdk.StackProps {
    clusterName: string;
    clusterVersion: eks.KubernetesVersion;
    amiReleaseVersion: string;
    userArn: string;
    tags: { [key: string]: string };
    vpc: any
}

export class EksClusterConstruct extends Construct {
    private cluster;
    constructor(scope: Construct, id: string, props: MyEksClusterStackProps) {
        super(scope, id);

        const { clusterName, clusterVersion, tags, vpc,userArn } = props;

        const eksRole = new iam.Role(this, 'EksRole', {
            assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy'),
            ],
        });


        this.cluster = new eks.Cluster(this, 'EksCluster', {
            clusterName,
            version: clusterVersion,
            vpc,
            defaultCapacity: 0,
            role: eksRole,
            endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
        });


        const nodeGroupRole = new iam.Role(this, 'NodeGroupRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
            ],
        });

        this.cluster.awsAuth.addUserMapping(iam.User.fromUserArn(this, 'User', userArn), {
            username: 'cluster-admin',
            groups: ['system:masters'],
        });


        const clusterAdminRole = new iam.Role(this, 'AdminRole', {
            assumedBy: new iam.AccountRootPrincipal(),
        });

        this.cluster.awsAuth.addMastersRole(clusterAdminRole);

        // const launchTemplate = new ec2.CfnLaunchTemplate(this, 'NodeLaunchTemplate', {
        //     launchTemplateData: {
        //         instanceType: 't3.small',
        //         metadataOptions: {
        //             httpTokens: 'required',  // Enforce the use of IMDSv2
        //         },
        //     },
        // });


        const nodeGroup = this.cluster.addNodegroupCapacity('default-node-group', {
            minSize: 2,
            maxSize: 5,
            desiredSize: 3,
            instanceTypes: [new ec2.InstanceType('t3.small')],
            nodeRole: nodeGroupRole,
        });
        nodeGroup.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));

        // new eks.KubernetesManifest(this, 'LoadBalancerService', {
        //     cluster: this.cluster,
        //     manifest: [
        //         {
        //             apiVersion: 'v1',
        //             kind: 'Service',
        //             metadata: {
        //                 name: 'my-service',
        //                 namespace: 'default',
        //             },
        //             spec: {
        //                 type: 'LoadBalancer',
        //                 selector: {
        //                     app: 'my-app',
        //                 },
        //                 ports: [
        //                     {
        //                         protocol: 'TCP',
        //                         port: 80,
        //                         targetPort: 8080,
        //                     },
        //                 ],
        //             },
        //         },
        //     ],
        // });
    }
    getCluster() {
        return this.cluster;
    }
}