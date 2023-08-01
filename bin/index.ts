// AWS CDK Modules
import { App } from 'aws-cdk-lib'

// Local Modules
import { Sofritas } from '../lib'

// Initialize the CDK App
const app = new App()

// Add the Stack to the App
new Sofritas(app, 'Sofritas', {
	env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
})