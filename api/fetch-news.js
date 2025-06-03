const Parser = require('rss-parser');
const parser = new Parser({
  requestOptions: {
    headers: {
      'User-Agent': 'MirrorIntelBot/1.0 (+https://mirror-intelligence.vercel.app)',
      'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
    }
  }
});

const topicFeeds = {
  bbc: {
    default: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    tech: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    health: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
    africa: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  },
  cnn: {
    default: 'http://rss.cnn.com/rss/edition_world.rss',
    tech: 'http://rss.cnn.com/rss/edition_technology.rss',
    health: 'http://rss.cnn.com/rss/edition_health.rss',
    politics: 'http://rss.cnn.com/rss/edition_politics.rss',
  },
  aljazeera: {
    default: 'https://www.aljazeera.com/xml/rss/all.xml'
  },
  timeslive: {
    default: 'https://www.timeslive.co.za/rss/?section=news'
  },
  mg: {
    default: 'https://mg.co.za/feed/'
  }
};

module.exports = async (req, res) => {
  const { source = 'bbc', topic } = req.query;
  const feedMap = topicFeeds[source] || topicFeeds['bbc'];
  const feedUrl = (topic && feedMap[topic]) ? feedMap[topic] : feedMap.default;

  try {
    const parsed = await parser.parseURL(feedUrl);

    if (!parsed.items || parsed.items.length === 0) {
      return res.status(200).json({ articles: [] });
    }

    const articles = parsed.items.slice(0, 5).map(item => ({
      title: item.title || "Untitled",
      url: item.link,
      description: item.contentSnippet || item.content || "No summary."
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ articles });

  } catch (err) {
    console.error("❌ Feed Error:", err.message);
    res.status(500).json({ error: "A server error occurred while fetching the news." });
  }
};
