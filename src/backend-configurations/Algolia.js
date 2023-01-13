import algoliasearch from "algoliasearch"

const ALGOLIA_APP_ID = 
const ALGOLIA_INDEX_KEY = 

var searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_INDEX_KEY);
var searchIndex = searchClient.initIndex('all_posts');

export {searchClient, searchIndex}
