export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  return res.end(JSON.stringify({ success: true, message: 'RonKws auth server is running' }));
}
