import { Stack, CfnOutput } from 'aws-cdk-lib'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { CfnServer } from 'aws-cdk-lib/aws-transfer'
import { Construct } from 'constructs'

export class Transfer extends Construct {

	server: CfnServer

  constructor(scope: Stack, id: string) {
    super(scope, id)
		
    const { roleArn: loggingRole } = new Role(this, 'LoggingRole', {
      assumedBy: new ServicePrincipal('transfer.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSTransferLoggingAccess'),
			],
    })

		const { logGroupArn } = new LogGroup(this, 'LogGroup')
		
    this.server = new CfnServer(this, 'Server', {
      domain: 'S3',
      endpointType: 'PUBLIC',

			// This can be Active Directory-managed as well
      identityProviderType: 'SERVICE_MANAGED',
			
      loggingRole,
      protocols: ['SFTP'],
			structuredLogDestinations: [
				logGroupArn,
			],
    })

		new CfnOutput(this, 'Endpoint', {
      value: `${this.server.attrServerId}.server.transfer.${scope.region}.amazonaws.com`,
    })
  }
}
