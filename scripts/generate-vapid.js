const webPush = require('web-push');
const keys = webPush.generateVAPIDKeys();
console.log('\nAdd these values to your .env and hosting environment variables:\n');
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('\nKeep VAPID_PRIVATE_KEY secret. Never commit it or expose it in frontend code.\n');
