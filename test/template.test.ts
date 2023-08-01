// AWS CDK Modules
import { App } from 'aws-cdk-lib'

// CDK Assertion Testing
import { Template } from 'aws-cdk-lib/assertions'

// Local Modules
import { Sofritas } from '../lib'

const app = new App()
const stack = new Sofritas(app, 'DummyStack', {})
const template = Template.fromStack(stack)

test('Template', () => {
	console.log(template)
})