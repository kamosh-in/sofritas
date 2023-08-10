import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {  CreateConnectorCommand, CreateConnectorCommandInput, CreateConnectorCommandOutput } from '@aws-sdk/client-transfer'

const getInput = (event: APIGatewayProxyEvent): CreateConnectorCommandInput =>  {
	return {
		AccessRole: '',
		Url: '',
		LoggingRole: '',
		SftpConfig: {
			TrustedHostKeys: [],
			UserSecretId: '',
		},
	}
}

const getCommand = (input: CreateConnectorCommandInput): CreateConnectorCommand =>  {
	return new CreateConnectorCommand(input)
}

const getResult = (response: CreateConnectorCommandOutput): APIGatewayProxyResult =>  {
	return {
		body: JSON.stringify({
			message: 'Create Connector Command Succeeded'
		}, null, 2),
		statusCode: 200,
	}
}

export const handler: APIGatewayProxyHandler = async (event) => {
	console.log(`EVENT:\n{JSON.stringify(event, null, 2)}`)
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Hello World!',
		}, null, 2),
	}
}