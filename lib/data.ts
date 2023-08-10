import { Stack } from 'aws-cdk-lib'
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export class Data extends Construct {
	bucket: Bucket
	accessRole: Role
  constructor(scope: Stack, id: string) {
    super(scope, id)

		this.bucket = new Bucket(this, 'Bucket')

    this.accessRole = new Role(this, 'AccessRole', {
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

    this.bucket.grantReadWrite(this.accessRole)
		
		this.bucket.grantReadWrite(workflowRole)
		// Also grant access to invoke any Lambda functions used in workflow
  }
}
