import algoliasearch from "algoliasearch"

const ALGOLIA_APP_ID = '4JSUG2XYBL'
const ALGOLIA_INDEX_KEY = '33b268447c26d059e89040574a6e22f0'

var searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_INDEX_KEY);
var searchIndex = searchClient.initIndex('all_posts');

export {searchClient, searchIndex}
