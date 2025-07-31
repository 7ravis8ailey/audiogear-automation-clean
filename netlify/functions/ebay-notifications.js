// Netlify function for eBay marketplace account deletion notifications
// Enhanced debug version to troubleshoot eBay verification

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const VERIFICATION_TOKEN = 'travis_bailey_ebay_token_2025_xyz';
  
  // Log all incoming requests for debugging
  console.log('🔍 Incoming request details:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
    body: event.body
  });
  
  // Handle verification challenge (eBay will send this to verify the endpoint)
  if (event.httpMethod === 'GET') {
    
    // Check if challenge_code is present
    if (!event.queryStringParameters || !event.queryStringParameters.challenge_code) {
      console.log('❌ No challenge_code found in query parameters');
      
      // Return basic info for health checks
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'eBay Marketplace Account Deletion Notification Endpoint',
          verification_token: 'configured',
          methods_supported: ['GET (verification)', 'POST (notifications)'],
          debug: 'Waiting for eBay challenge_code parameter',
          expectedParams: ['challenge_code', 'verification_token']
        })
      };
    }
    
    const challengeCode = event.queryStringParameters.challenge_code;
    const verificationToken = event.queryStringParameters.verification_token;
    
    console.log('🔍 eBay verification challenge received:', {
      challengeCode,
      verificationToken,
      expectedToken: VERIFICATION_TOKEN,
      tokenMatch: verificationToken === VERIFICATION_TOKEN
    });
    
    // Handle case where verification_token is missing (some eBay implementations don't send it)
    if (!verificationToken) {
      console.log('⚠️ No verification_token in request, using configured token');
      
      // Use our configured token
      const endpointUrl = `https://${event.headers.host}/.netlify/functions/ebay-notifications`;
      const combinedString = challengeCode + VERIFICATION_TOKEN + endpointUrl;
      
      console.log('🔧 Creating hash without received token:', {
        challengeCode,
        verificationToken: VERIFICATION_TOKEN,
        endpointUrl,
        combinedString,
        combinedLength: combinedString.length
      });
      
      const hash = crypto.createHash('sha256');
      hash.update(combinedString, 'utf8');
      const challengeResponse = hash.digest('hex');
      
      console.log('✅ Challenge response generated (no token case):', challengeResponse);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeResponse: challengeResponse
        })
      };
    }
    
    // Verify the token matches (if provided)
    if (verificationToken === VERIFICATION_TOKEN) {
      const endpointUrl = `https://${event.headers.host}/.netlify/functions/ebay-notifications`;
      const combinedString = challengeCode + verificationToken + endpointUrl;
      
      console.log('🔧 Creating hash with received token:', {
        challengeCode,
        verificationToken,
        endpointUrl,
        combinedString,
        combinedLength: combinedString.length
      });
      
      const hash = crypto.createHash('sha256');
      hash.update(combinedString, 'utf8');
      const challengeResponse = hash.digest('hex');
      
      console.log('✅ Challenge response generated (token match):', challengeResponse);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeResponse: challengeResponse
        })
      };
    } else {
      console.log('❌ Verification token mismatch:', {
        received: verificationToken,
        expected: VERIFICATION_TOKEN,
        receivedLength: verificationToken ? verificationToken.length : 0,
        expectedLength: VERIFICATION_TOKEN.length
      });
      
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Invalid verification token',
          received: verificationToken,
          expected: 'travis_bailey_ebay_token_2025_xyz'
        })
      };
    }
  }
  
  // Handle actual marketplace account deletion notifications
  if (event.httpMethod === 'POST') {
    const notification = JSON.parse(event.body || '{}');
    
    console.log('📬 Received eBay marketplace account deletion notification:', notification);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'received',
        timestamp: new Date().toISOString(),
        notificationId: notification?.notification?.notificationId || 'unknown'
      })
    };
  }
  
  // Handle other HTTP methods
  console.log('❓ Unhandled HTTP method:', event.httpMethod);
  
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: 'Method not allowed',
      method: event.httpMethod,
      supportedMethods: ['GET', 'POST']
    })
  };
};
