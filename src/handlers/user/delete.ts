import { DeleteUserCommand, DeleteUserCommandInput } from '@aws-sdk/client-transfer'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { transferClient } from '../../lib/aws'
import { SERVER_ID as ServerId } from '../../lib/env'

const getInput = (event: APIGatewayProxyEvent): DeleteUserCommandInput =>  {
	const { Id: UserName } = event.pathParameters as { Id: string }
	return {
		ServerId,
		UserName,
	}
}

const getCommand = (input: DeleteUserCommandInput): DeleteUserCommand =>  {
	return new DeleteUserCommand(input)
}

const getResult = (statusCode: number): APIGatewayProxyResult =>  {
	let	message = 'Delete User Command Failed'
	if (statusCode == 200)
		message = 'Delete User Command Succeeded'
	
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