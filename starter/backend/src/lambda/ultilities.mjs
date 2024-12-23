import { parseUserId } from '../auth/utils.mjs'

export function getUserId(event) {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
export const HTTP_STATUS_CODE = {
  SUCCESS: 200,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404
}
export const responseSuccess = (data) => {
  return {
      statusCode: HTTP_STATUS_CODE.SUCCESS,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: data
  }
}

export const responseError = (data, statusCode = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) => {
  return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: data
  }
}