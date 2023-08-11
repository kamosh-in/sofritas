import { CreateUserCommand, CreateUserCommandInput } from '@aws-sdk/client-transfer'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { transferClient } from '../../lib/aws'
import { BUCKET_NAME as BucketName, ROLE_ARN as Role, SERVER_ID as ServerId } from '../../lib/env'

const getInput = (event: APIGatewayProxyEvent): CreateUserCommandInput =>  {
	const { HomeDirectory, SshPublicKeyBody, UserName } = JSON.parse(event.body as string)
	
	if (!SshPublicKeyBody || !UserName)
		throw Error('SshPublicKeyBody or UserName missing')

	let Target
	HomeDirectory? Target = `/${BucketName}/${HomeDirectory}`: Target = `/${BucketName}/${UserName}`
	
	return {
		HomeDirectoryMappings: [
			{
				Entry: '/',
				Target,
			}
		],
		HomeDirectoryType: 'LOGICAL',
		Role,
		ServerId,
		SshPublicKeyBody,
		UserName,
	}
}

const getCommand = (input: CreateUserCommandInput): CreateUserCommand =>  {
	return new CreateUserCommand(input)
}

const getResult = (statusCode: number): APIGatewayProxyResult =>  {
	let	message = 'Create User Command'
	statusCode == 200 ? message += 'Succeeded': message += 'Failed'
	
	return {
		body: JSON.stringify({
			message
		}, null, 2),
		statusCode,
	}
}

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		console.log(`EVENT:\n${JSON.stringify(event, null, 2)}`)
		const input = getInput(event)
		console.log(`INPUT:\n${JSON.stringify(input, null, 2)}`)
		const command = getCommand(input)
		console.log(`COMMAND:\n${JSON.stringify(command, null, 2)}`)
		const response = await transferClient.send(command)
		console.log(`RESPONSE:\n${JSON.stringify(response, null, 2)}`)
		return getResult(200)
	} catch (error) {
		console.log(`ERROR:\n${JSON.stringify(error, null, 2)}`)
		return getResult(400)
	}
}