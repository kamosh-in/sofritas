import { ListUsersCommand, ListUsersCommandInput, ListUsersCommandOutput } from '@aws-sdk/client-transfer'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { transferClient } from '../../lib/aws'
import { SERVER_ID as ServerId } from '../../lib/env'

const getInput = (): ListUsersCommandInput =>  {
	return {
		ServerId,
	}
}

const getCommand = (input: ListUsersCommandInput): ListUsersCommand =>  {
	return new ListUsersCommand(input)
}

const getResult = (statusCode: number, response?: ListUsersCommandOutput): APIGatewayProxyResult =>  {
	let	message: any = {
		Users: [],
	}
	
	statusCode == 200 ? response?.Users?.forEach(element => {
		message.Users.push(element.UserName)
	}) : message = 'List User Command Failed'

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
		const input = getInput()
		console.log(`INPUT:\n${JSON.stringify(input, null, 2)}`)
		const command = getCommand(input)
		console.log(`COMMAND:\n${JSON.stringify(command, null, 2)}`)
		const response = await transferClient.send(command)
		console.log(`RESPONSE:\n${JSON.stringify(response, null, 2)}`)
		return getResult(200, response)
	} catch (error) {
		console.log(`ERROR:\n${JSON.stringify(error, null, 2)}`)
		return getResult(400)
	}
}