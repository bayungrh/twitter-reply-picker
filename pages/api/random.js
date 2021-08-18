import rp from 'request-promise';
import loadbalance from 'loadbalance';

const getTweet = (tweetId) => {
  return rp({
    uri: `https://api.twitter.com/1.1/statuses/show.json?id=${tweetId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    },
    json: true
  })
  .catch(() => {});
}

const parseUrl = (url) => {
  url = new URL(url);
  if (url.hostname !== 'twitter.com') return false;
  if (!url.pathname.includes('/status/')) return false;
  const path = url.pathname.split('/');
  return {
    screen_name: path[1],
    id: path[3]
  }
}

export default (req, res) => {
  const limit = 100;
  const { url } = req.query;
  const parse = parseUrl(url);

  if (!parse) return res.status(400).json({
    code: 400,
    error: 'Invalid URL'
  });

  return rp({
    uri: `https://api.twitter.com/2/tweets/search/recent?query=(to:${parse.screen_name}) conversation_id:${parse.id}&max_results=${limit}&tweet.fields=author_id,created_at,entities,geo,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    },
    json: true
  })
  .then(async (res) => {
    const indexes = [];
    const data = res.data.sort( () => Math.random() - 0.5);
    for (let index = 0; index < data.length; index++) {
      indexes.push(index);
    }
    const engine = loadbalance.random(indexes);
    const pick = engine.pick();
    const result = data[pick];
    const status = await getTweet(result.id);
    return status;
  })
  .then((data) => res.status(200).json({
    code: 200,
    result: data
  }))
  .catch((err) => res.status(500).json({
    code: 500,
    error: err.message
  }));
}
