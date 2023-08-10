// AWS CDK Modules
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'

// Additional Modules
import { resolve } from 'path'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { CfnServer } from 'aws-cdk-lib/aws-transfer'

// Props for the Handler Construct
interface HandlerProps {
	bucketName: string
	roleArn: string
	serverId: string
}

// Construct for the Handler
class Handler extends Construct {
	user: { create: NodejsFunction; read: NodejsFunction; update: NodejsFunction; delete: NodejsFunction }
	connector: { create: NodejsFunction; delete: NodejsFunction; read: NodejsFunction; update: NodejsFunction }
  constructor(scope: Api, id: string, props: HandlerProps) {
    super(scope, id)

		// Role to assume for the Lambda Functions
		const role = new Role(this, 'Role', {
			assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
				ManagedPolicy.fromAwsManagedPolicyName('AWSTransferFullAccess'),
			],
		})

		// Common properties for all functions
		const handlerProps: NodejsFunctionProps = {
			environment: {
				BUCKET_NAME: props.bucketName,
				ROLE_ARN: props.roleArn,
				SERVER_ID: props.serverId
			},
			role,
		}

		// User Create function
		const userCreate = new NodejsFunction(this, 'UserCreate', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/create.ts')
		})

		// User Read function
		const userRead = new NodejsFunction(this, 'UserRead', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/read.ts')
		})

		// User Update function
		const userUpdate = new NodejsFunction(this, 'UserUpdate', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/update.ts')
		})

		// User Delete function
		const userDelete = new NodejsFunction(this, 'UserDelete', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/delete.ts')
		})

		// connector Create function
		const connectorCreate = new NodejsFunction(this, 'ConnectorCreate', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connector/create.ts')
		})

		// connector Read function
		const connectorRead = new NodejsFunction(this, 'ConnectorRead', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connector/read.ts')
		})

		// connector Update function
		const connectorUpdate = new NodejsFunction(this, 'ConnectorUpdate', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connector/update.ts')
		})

		// connector Delete function
		const connectorDelete = new NodejsFunction(this, 'ConnectorDelete', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connector/delete.ts')
		})

		this.user = {
			create: userCreate,
			delete: userDelete,
			read: userRead,
			update: userUpdate,
		}

		this.connector = {
			create: connectorCreate,
			delete: connectorDelete,
			read: connectorRead,
			update: connectorUpdate,
		}
	}
}

// Props for the Authorizer Construct
interface AuthorizerProps {}

// Construct for the Authorizer
class Authorizer extends Construct {

	// Accessible properties by the parent
	authorizer: TokenAuthorizer

	constructor(scope: Api, id: string, props?: AuthorizerProps) {
		super(scope, id)

		// Generated secret token
		const token = new Secret(this, 'Token')

		// Lambda function for handling Authorization
		const authorizeHandler = new NodejsFunction(this, 'Handler', {
			entry: resolve(__dirname, '../src/handlers/authorize.ts'),
			environment: {
				SECRET_NAME: token.secretName,
			},
		})

		// Authorization handler can read token value
		token.grantRead(authorizeHandler)

		// API Gateway Authorizer component to attach to API methods
		this.authorizer = new TokenAuthorizer(this, 'Authorizer', {
			handler: authorizeHandler,
			identitySource: 'method.request.header.Authorization',
			resultsCacheTtl: Duration.minutes(0),
		})

		// Output the token name to CloudFormation
		new CfnOutput(this, 'TokenName', {
			value: token.secretName
		})
	}
}

// Props for the Api Construct
export interface ApiProps {
	accessRole: Role
	bucket: Bucket
	server: CfnServer
}

// Construct for the Api
export class Api extends Construct {
  constructor(scope: Stack, id: string, props: ApiProps) {
    super(scope, id)

		const { bucketName } = props.bucket
		const { roleArn } = props.accessRole
		const {attrServerId: serverId} = props.server

		// Initialize Handler Construct
		const handler = new Handler(this, 'Handler', {
			bucketName,
			roleArn,
			serverId
		})

		// Initialize Authorizer Construct
		const { authorizer } = new Authorizer(this, 'Authorizer')

		// REST API with Edge-optimized Endpoint
		const api = new RestApi(this, 'Api', {
			defaultMethodOptions: {

				// Authorize each request with the Authorizer
				authorizer,
			},
		})

		// Resources

		// /connector
		const rootConnector = api.root.addResource('connector')

		// /connector/{Id}
		const rootConnectorId = rootConnector.addResource('{Id}')
		
		// /user
		const rootUser = api.root.addResource('user')

		// /user/{Id}
		const rootUserId = rootUser.addResource('{Id}')

		// connector Methods
		
		// POST /connector
		rootConnector.addMethod('POST', new LambdaIntegration(handler.connector.create))

		// GET /connector
		rootConnector.addMethod('GET', new LambdaIntegration(handler.connector.read))

		// PUT /connector/{Id}
		rootConnectorId.addMethod('PUT', new LambdaIntegration(handler.connector.update))

		// DELETE /connector/{Id}
		rootConnectorId.addMethod('DELETE', new LambdaIntegration(handler.connector.delete))

		// User Methods

		// POST /user
		rootUser.addMethod('POST', new LambdaIntegration(handler.user.create))

		// GET /user
		rootUser.addMethod('GET', new LambdaIntegration(handler.user.read))

		// PUT /user/{Id}
		rootUserId.addMethod('PUT', new LambdaIntegration(handler.user.update))

		// DELETE /user/{Id}
		rootUserId.addMethod('DELETE', new LambdaIntegration(handler.user.delete))
  }
}