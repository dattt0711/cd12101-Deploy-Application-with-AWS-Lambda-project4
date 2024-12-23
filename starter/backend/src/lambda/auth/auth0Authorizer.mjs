import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const auth0Cer = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJU3B4nC/G2ZtyMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1wNDM1cnh2cjE1ZzVhY2lyLnVzLmF1dGgwLmNvbTAeFw0yNDEyMjEx
NjMzNDJaFw0zODA4MzAxNjMzNDJaMCwxKjAoBgNVBAMTIWRldi1wNDM1cnh2cjE1
ZzVhY2lyLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAM0hiqizFXvYOAd99JFG3B9GCf5K+dHnBaww3wOZJj6j4K6PjkzychsSumlp
Vf0p5F+J495cGWywFkSOpMpf8IzimI8vJ76IPWfw8ywrTe7BiNvqjw8AHbrncWpJ
cBwvL5a++GekEAD9jT50SmbwOAxRTB++FwzC9PbGJVbjHVGXho9tRCTe4m/jPKvE
qUW+XGTQj7KLgurAtyyuHoIRbOTLB6Rusfk6k8XV0XTuoaYBpTES7m2cHYwAM3hd
EkYjU4j460YFU8KOKA8AKRT5X6Pc27XyVJYnd0ilS5E+eHMTFsZtR24tKCWaRXof
276gGWiw6drgLhkoRw42TlzeomkCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUkZOPjhlDdE+EFG2QD6xWdu3NshcwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAZm8Q4xtmrVGgtNVNo0GImz0i4jXBGd6496+od+Hwp
V99tQLB7yaxKqfTCUX+RJp6IP+7jHn4yWFxqLOoUg0ei6c6d74lWG3FZxOe2PJ0q
I5HQf8XezctZH7vsEKypiJlOjl7S4ogmRwcRwpTxlr2aUHyGtwvly4syadM5E2LE
V9bFSA6uWdEdBF1sDHaydVMOUwth9OqHHreAyHaXvwXPEdrYT4GVBwg+mt7UfcEC
5ZZIkcJdwiaNt7Zp3iZTytMbuLDtd4ez3CpHr5jQa8Vpo5glu1GU7T9AtZosUGXS
bpVNrI+AKy9SDix886pAsNR2p/8OMYNbcGO2nmmDDiAC
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', {
      // Additional information stored with a log statement
      key: jwtToken
    })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  // TODO: Implement token verification
  return jsonwebtoken.verify(token, auth0Cer, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
