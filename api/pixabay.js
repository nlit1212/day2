export default async function handler(req, res) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const q = String(req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력하세요.' });
  }

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key,
    q,
    image_type: 'photo',
    per_page: '10',
    page: String(page),
    lang: 'ko'
  });

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Pixabay 요청 실패 (' + upstream.status + ')' });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({
      totalHits: data.totalHits,
      hits: data.hits.map(h => ({
        id: h.id,
        pageURL: h.pageURL,
        webformatURL: h.webformatURL,
        tags: h.tags
      }))
    });
  } catch (err) {
    return res.status(502).json({ error: '서버 오류: ' + err.message });
  }
}
