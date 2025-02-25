import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';


interface IProps extends cdk.StackProps{
    vpcCidr: string;
}
export class VPCClusterGroup extends Construct{
    private readonly vpc;

    constructor(scope:Construct, id: string,props: IProps) {
        super(scope, id);
        const {vpcCidr} = props
        this.vpc = new ec2.Vpc(this, 'Vpc', {
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
    }

    getVpc(){
        return this.vpc;
    }

}