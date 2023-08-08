// AWS CDK Modules
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'

// Additional Modules
import { resolve } from 'path'

// Props for the Handler Construct
interface HandlerProps {}

// Construct for the Handler
class Handler extends Construct {
	user: { create: NodejsFunction; read: NodejsFunction; update: NodejsFunction; delete: NodejsFunction }
	connection: { create: NodejsFunction; delete: NodejsFunction; read: NodejsFunction; update: NodejsFunction }
  constructor(scope: Api, id: string, props?: HandlerProps) {
    super(scope, id)

		// Role to assume for the Lambda Functions
		const role = new Role(this, 'Role', {
			assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute')
			],
		})

		// Common properties for all functions
		const handlerProps: NodejsFunctionProps = {
			// environment: {},
			role,
		}

		// User Create function
		const userCreate = new NodejsFunction(this, 'Create', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/create.ts')
		})

		// User Read function
		const userRead = new NodejsFunction(this, 'Read', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/read.ts')
		})

		// User Update function
		const userUpdate = new NodejsFunction(this, 'Update', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/update.ts')
		})

		// User Delete function
		const userDelete = new NodejsFunction(this, 'Delete', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/user/delete.ts')
		})

		// Connection Create function
		const connectionCreate = new NodejsFunction(this, 'Create', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connection/create.ts')
		})

		// Connection Read function
		const connectionRead = new NodejsFunction(this, 'Read', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connection/read.ts')
		})

		// Connection Update function
		const connectionUpdate = new NodejsFunction(this, 'Update', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connection/update.ts')
		})

		// Connection Delete function
		const connectionDelete = new NodejsFunction(this, 'Delete', {
			...handlerProps,
			entry: resolve(__dirname, '../src/handlers/connection/delete.ts')
		})

		this.user = {
			create: userCreate,
			delete: userDelete,
			read: userRead,
			update: userUpdate,
		}

		this.connection = {
			create: connectionCreate,
			delete: connectionDelete,
			read: connectionRead,
			update: connectionUpdate,
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
export interface ApiProps {}

// Construct for the Api
export class Api extends Construct {
  constructor(scope: Stack, id: string, props: ApiProps) {
    super(scope, id)

		// Initialize Handler Construct
		const handler = new Handler(this, 'Handler')

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

		// /connection
		const rootConnection = api.root.addResource('connection')

		// /connection/{Id}
		const rootConnectionId = rootConnection.addResource('{Id}')
		
		// /user
		const rootUser = api.root.addResource('user')

		// /user/{Id}
		const rootUserId = rootUser.addResource('{Id}')

		// Connection Methods
		
		// POST /connection
		rootConnection.addMethod('POST', new LambdaIntegration(handler.connection.create))

		// GET /connection
		rootConnection.addMethod('GET', new LambdaIntegration(handler.connection.read))

		// PUT /connection/{Id}
		rootConnectionId.addMethod('PUT', new LambdaIntegration(handler.connection.update))

		// DELETE /connection/{Id}
		rootConnectionId.addMethod('DELETE', new LambdaIntegration(handler.connection.delete))

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