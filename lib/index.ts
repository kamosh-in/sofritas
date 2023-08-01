import { Stack, StackProps, App } from 'aws-cdk-lib'

import { Data } from './data'
import { Transfer } from './transfer'

export class Sofritas extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    new Transfer(this, 'Transfer')

		new Data(this, 'Data')
  }
}
