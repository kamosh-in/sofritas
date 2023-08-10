declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BUCKET_NAME: string
			ROLE_ARN: string
			SECRET_NAME: string
			SERVER_ID: string
    }
  }
}

export const { BUCKET_NAME, ROLE_ARN, SECRET_NAME, SERVER_ID } = process.env