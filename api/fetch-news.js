const Parser = require('rss-parser');
const parser = new Parser({
  requestOptions: {
    headers: {
      'User-Agent': 'MirrorIntelBot/1.0 (+https://mirror-intel-newstoday.vercel.app)',
      'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
    }
  }
});

const sources = {
  bbc: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition_world.rss',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  timeslive: 'https://www.timeslive.co.za/rss/?section=news',
  mg: 'https://mg.co.za/feed/',
};

module.exports = async (req, res) => {
  const { source } = req.query;
  const feedUrl = sources[source] || sources.bbc;

  try {
    const parsed = await parser.parseURL(feedUrl);

    if (!parsed.items || parsed.items.length === 0) {
      return res.status(200).json({ articles: [] });
    }

    const trimmed = parsed.items.slice(0, 5).map(item => ({
      title: item.title || "Untitled",
      url: item.link,
      description: item.contentSnippet || item.content || "No summary."
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ articles: trimmed });

  } catch (err) {
    console.error("❌ Feed Error:", err.message);
    res.status(500).json({ error: "A server error occurred while fetching the news." });
  }
};
