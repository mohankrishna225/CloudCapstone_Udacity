import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJCItAkuNkAHMWMA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEm1vaGFuMjI1LmF1dGgwLmNvbTAeFw0yMDA0MDQxMDI5MDhaFw0zMzEyMTIx
MDI5MDhaMB0xGzAZBgNVBAMTEm1vaGFuMjI1LmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAOtyRk667AKk+dH2fzkw9CKPCnNOA3nZKIpY
cqTYwozWmnPa8D+0x2ec/M73KfU5icwl1F0CWGgWaiIkOC9eF3EXmhK+6Dg6b061
rnVo1OMTuNGEai9yBaV5Z47cQgKqaNdXsH6zgjc4U9lFF6F5VqTL582GUq6nCbxl
kaIkNA8/QsUhZgr6dKU3hDeY8mW4zLhEWn0ct/FIXwG4kZNf/DvRybZzC4I3YJSD
ywyCX1rwVHnRQufiDUNR92H3GFbjGfirHq4biW/MM22rwfwROZ3X1RMWMs2yP6qS
i8iOSu7vIUj2+L1IoJ4iC7kkgaOPyst417X5OsOvbdbOkZ4ZSJsCAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUZo7j82h3XP1J3JBIbqKCEUneIC8w
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQC1doZTdxclgYHzhF7F
1hwkTXYN43k8osMx5hIdMYnNBwjQa8iCneSnYJCiQro9bVk1BSdZnUq1KJAg/7UI
AgSsK826MVCwknVFxrvoNtitwM8t27UEiFRK2J7wU5v+qlLcUy9YYTDZ00/fUfZC
mhYeIGkysu+QWeYCmTsV1DW0bHewtrbvvEyDCZ7RNNteBJCStKhojmtWFZcOYJ8/
DiTgFej1qbfrbiwYklWHThJtdwyZozy9FSry9RNIFVhlh+SUnmg5njrylchyBbRw
SiEOlYONbPchf5KMeFVV21mbcW/2AK8pZSzMDnlNTaIyBgWR/3XYddxXaszof+IX
7Qw7
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log(jwt, Axios, verify, jwt)

  return verify(token, cert,  { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
