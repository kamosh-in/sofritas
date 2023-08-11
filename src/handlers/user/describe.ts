import { DescribeUserCommand, DescribeUserCommandInput, DescribeUserCommandOutput, HomeDirectoryMapEntry, SshPublicKey } from '@aws-sdk/client-transfer'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { transferClient } from '../../lib/aws'
import { SERVER_ID as ServerId } from '../../lib/env'

const getInput = (event: APIGatewayProxyEvent): DescribeUserCommandInput =>  {
	const { Id: UserName } = event.pathParameters as { Id: string }
	return {
		ServerId,
		UserName,
	}
}

const getCommand = (input: DescribeUserCommandInput): DescribeUserCommand =>  {
	return new DescribeUserCommand(input)
}

const getResult = (statusCode: number, response?: DescribeUserCommandOutput): APIGatewayProxyResult =>  {
	let	message
	statusCode == 200 ? message = {
		HomeDirectory: (response?.User?.HomeDirectoryMappings as HomeDirectoryMapEntry[])[0].Target,
		PublicKey: (response?.User?.SshPublicKeys as SshPublicKey[])[0].SshPublicKeyBody,
		UserName: response?.User?.UserName,
	} : message = 'Describe User Command Failed'



		// 	const { HomeDirectoryMappings, SshPublicKeys, UserName } = response.User
		// 	const { Target: HomeDirectory } = (HomeDirectoryMappings as HomeDirectoryMapEntry[])[0]
		// 	const { SshPublicKeyBody: PublicKey } = (SshPublicKeys as SshPublicKey[])[0]
		// 	message = {
		// 		HomeDirectory,
		// 		PublicKey,
		// 		UserName,
		// 	}
		// }

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
		return getResult(200, response)
	} catch (error) {
		console.log(`ERROR:\n${JSON.stringify(error, null, 2)}`)
		return getResult(400)
	}
}