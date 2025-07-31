// Netlify function for eBay marketplace account deletion notifications
// Handles both verification patterns eBay might use

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const VERIFICATION_TOKEN = 'travis_bailey_ebay_token_2025_xyz';
  
  console.log('🔍 Incoming request:', {
    method: event.httpMethod,
    params: event.queryStringParameters,
    headers: Object.keys(event.headers || {})
  });
  
  // Handle verification challenge (eBay GET request)
  if (event.httpMethod === 'GET') {
    
    // Check if this is an eBay verification challenge
    if (event.queryStringParameters && event.queryStringParameters.challenge_code) {
      const challengeCode = event.queryStringParameters.challenge_code;
      const receivedToken = event.queryStringParameters.verification_token;
      
      console.log('🔍 eBay challenge detected:', {
        challengeCode,
        receivedToken,
        hasReceivedToken: !!receivedToken
      });
      
      // Use the appropriate verification token
      const tokenToUse = receivedToken || VERIFICATION_TOKEN;
      
      // Verify token if one was received
      if (receivedToken && receivedToken !== VERIFICATION_TOKEN) {
        console.log('❌ Token verification failed');
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Invalid verification token'
          })
        };
      }
      
      // Generate challenge response
      const endpointUrl = `https://${event.headers.host}/.netlify/functions/ebay-notifications`;
      const combinedString = challengeCode + tokenToUse + endpointUrl;
      
      console.log('🔧 Generating response:', {
        challengeCode,
        token: tokenToUse,
        endpoint: endpointUrl,
        combined: combinedString
      });
      
      const hash = crypto.createHash('sha256');
      hash.update(combinedString, 'utf8');
      const challengeResponse = hash.digest('hex');
      
      console.log('✅ Challenge response:', challengeResponse);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeResponse: challengeResponse
        })
      };
    }
    
    // Health check response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'eBay Webhook Endpoint Ready',
        verification_token_configured: true,
        endpoint: `https://${event.headers.host}/.netlify/functions/ebay-notifications`,
        methods: ['GET (verification)', 'POST (notifications)']
      })
    };
  }
  
  // Handle actual marketplace account deletion notifications
  if (event.httpMethod === 'POST') {
    try {
      const notification = JSON.parse(event.body || '{}');
      
      console.log('📬 Account deletion notification:', {
        topic: notification?.metadata?.topic,
        notificationId: notification?.notification?.notificationId,
        userId: notification?.notification?.data?.userId
      });
      
      // Respond with success immediately
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'received',
          timestamp: new Date().toISOString()
        })
      };
    } catch (error) {
      console.log('❌ Error processing notification:', error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid notification format' })
      };
    }
  }
  
  // Unsupported method
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Method not allowed',
      supported: ['GET', 'POST']
    })
  };
};
