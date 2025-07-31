// Netlify function for eBay marketplace account deletion notifications
// This handles eBay's notification requirements

exports.handler = async (event, context) => {
  const VERIFICATION_TOKEN = 'travis_bailey_ebay_token_2025_xyz';
  
  // Handle verification challenge (eBay will send this to verify the endpoint)
  if (event.httpMethod === 'GET' && event.queryStringParameters.challenge_code) {
    const challengeCode = event.queryStringParameters.challenge_code;
    const verificationToken = event.queryStringParameters.verification_token;
    
    // Verify the token matches
    if (verificationToken === VERIFICATION_TOKEN) {
      // Calculate challengeResponse (base64 encode of challenge_code + verification_token + endpoint_url)
      const endpointUrl = `https://${event.headers.host}/.netlify/functions/ebay-notifications`;
      const combinedString = challengeCode + verificationToken + endpointUrl;
      const challengeResponse = Buffer.from(combinedString).toString('base64');
      
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
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid verification token' })
      };
    }
  }
  
  // Handle actual marketplace account deletion notifications
  if (event.httpMethod === 'POST') {
    const notification = JSON.parse(event.body || '{}');
    
    // Log the notification (in production, you'd process this)
    console.log('Received eBay marketplace account deletion notification:', notification);
    
    // Process the notification here
    // For now, just acknowledge receipt
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'received',
        timestamp: new Date().toISOString()
      })
    };
  }
  
  // Handle other requests
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'eBay Marketplace Account Deletion Notification Endpoint',
      verification_token: 'configured',
      methods_supported: ['GET (verification)', 'POST (notifications)']
    })
  };
};
