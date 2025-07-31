// Netlify function for eBay marketplace account deletion notifications
// This handles eBay's notification requirements with proper SHA-256 hashing

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const VERIFICATION_TOKEN = 'travis_bailey_ebay_token_2025_xyz';
  
  // Handle verification challenge (eBay will send this to verify the endpoint)
  if (event.httpMethod === 'GET' && event.queryStringParameters && event.queryStringParameters.challenge_code) {
    const challengeCode = event.queryStringParameters.challenge_code;
    const verificationToken = event.queryStringParameters.verification_token;
    
    console.log('🔍 eBay verification challenge received:', {
      challengeCode,
      verificationToken,
      expectedToken: VERIFICATION_TOKEN
    });
    
    // Verify the token matches
    if (verificationToken === VERIFICATION_TOKEN) {
      // Calculate challengeResponse using SHA-256 hash as per eBay documentation
      // Format: challengeCode + verificationToken + endpoint
      const endpointUrl = `https://${event.headers.host}/.netlify/functions/ebay-notifications`;
      const combinedString = challengeCode + verificationToken + endpointUrl;
      
      console.log('🔧 Creating hash for:', {
        challengeCode,
        verificationToken,
        endpointUrl,
        combinedString
      });
      
      // Use SHA-256 hash (not base64) as per eBay documentation
      const hash = crypto.createHash('sha256');
      hash.update(combinedString);
      const challengeResponse = hash.digest('hex');
      
      console.log('✅ Challenge response generated:', challengeResponse);
      
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
        expected: VERIFICATION_TOKEN
      });
      
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Invalid verification token',
          received: verificationToken
        })
      };
    }
  }
  
  // Handle actual marketplace account deletion notifications
  if (event.httpMethod === 'POST') {
    const notification = JSON.parse(event.body || '{}');
    
    console.log('📬 Received eBay marketplace account deletion notification:', notification);
    
    // Process the notification here
    // For now, just acknowledge receipt
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
  
  // Handle other requests (health check)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'eBay Marketplace Account Deletion Notification Endpoint',
      verification_token: 'configured',
      methods_supported: ['GET (verification)', 'POST (notifications)'],
      documentation: 'https://developer.ebay.com/api-docs/static/notifications.html'
    })
  };
};
