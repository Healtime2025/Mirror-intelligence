const Parser = require('rss-parser');
const parser = new Parser();

const sources = {
  bbc: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition_world.rss',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  news24: 'https://feeds.news24.com/articles/news24/TopStories/rss',
  iol: 'https://www.iol.co.za/cmlink/1.640',
  timeslive: 'https://www.timeslive.co.za/rss/?section=news',
  maverick: 'https://www.dailymaverick.co.za/feed/',
  mg: 'https://mg.co.za/feed/',
};

module.exports = async (req, res) => {
  const { source } = req.query;
  const feedUrl = sources[source] || sources.bbc;

  try {
    const parsed = await parser.parseURL(feedUrl);
    const trimmed = parsed.items.slice(0, 5).map(item => ({
      title: item.title || "Untitled",
      url: item.link,
      description: item.contentSnippet || item.content || "No summary."
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ articles: trimmed });

  } catch (err) {
    console.error("❌ Feed Error:", err.message);
    res.status(500).json({ error: "Failed to fetch the news feed." });
  }
};
