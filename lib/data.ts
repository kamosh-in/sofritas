import { Stack } from 'aws-cdk-lib'
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export class Data extends Construct {
  constructor(scope: Stack, id: string) {
    super(scope, id)

		const bucket = new Bucket(this, 'Bucket')

    const accessRole = new Role(this, 'AccessRole', {
      assumedBy: new ServicePrincipal('transfer.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
			],
		}) 
		
		const workflowRole = new Role(this, 'WorkflowRole', {
			assumedBy: new ServicePrincipal('transfer.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('AWSTransferFullAccess')
			],
		})

    bucket.grantReadWrite(accessRole)
		
		bucket.grantReadWrite(workflowRole)
		// Also grant access to invoke any Lambda functions used in workflow
  }
}
