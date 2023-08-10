import { Stack, StackProps, App } from 'aws-cdk-lib'

import { Api } from './api'
import { Data } from './data'
import { Transfer } from './transfer'

export class Sofritas extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    const { server } = new Transfer(this, 'Transfer')

		const { accessRole, bucket} = new Data(this, 'Data')

		new Api(this, 'Api', {
			accessRole,
			bucket,
			server,
		})
  }
}
