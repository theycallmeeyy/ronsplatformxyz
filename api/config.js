export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID || null;
  return res.end(JSON.stringify({ success: true, config: { googleClientId } }));
}
