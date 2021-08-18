import { useState } from 'react';
import rp from 'request-promise';
import { Icon, Input, Container, Message, Loader } from 'semantic-ui-react';
import { Tweet } from 'react-twitter-widgets'

const MainComponent = (props) => {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTweet = () => {
    if (!query) return;
    setData(null);
    setLoading(true);
    setError(null);
    return rp({
      uri: `https://twitter-reply-pick.vercel.app/api/random?url=${query}`,
      method: 'GET',
      json: true
    }).then((res) => {
      console.info('res', res.result);
      if (res && res.code === 200) {
        setData(res.result);
      } else {
        setError(res.error);
      }
    }).finally(() => {
      setLoading(false);
    }).catch((err) => {
      setError(err.error.error);
    });
  }

  const inputQuery = (e) => {
    setQuery(e.target.value);
  }

  return (
    <div>
      <Container style={{marginTop: '50px'}}>
        <Message compact style={{width: '100%'}}>
          [X] Twitter Reply Picker [X]
        </Message>
        <Input
          icon={<Icon name='search' inverted circular link onClick={searchTweet} />}
          placeholder='Example: https://twitter.com/reactjs/status/1402320383932502021'
          onChange={inputQuery}
          style={{width:'100%', paddingBottom: '50px'}}
        />

        {loading && <div style={{textAlign:'center'}}><Loader active inline /></div>}
        { error && <center><h3>{error}</h3></center> }
        { data && data.id && (
          <Tweet 
            tweetId={data.id_str}
            options={{
              align: "center",
              theme: "light"
            }}
          />
        )}

        <div style={{marginTop: '40px', textAlign: 'center'}}>
          <p>Made using Next.js and Semantic UI.</p>
          <a href="https://github.com/bayungrh/twitter-reply-picker" target="_blank">View Repository</a>
        </div>

      </Container>
    </div>
  )
}

export default MainComponent;