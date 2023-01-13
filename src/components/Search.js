import React, {useState} from 'react'
import {searchClient} from '../backend-configurations/Algolia'
import { InstantSearch, SearchBox, Hits, VoiceSearch, RefinementList, RangeInput, Pagination } from 'react-instantsearch-dom'
import Hit from './Hit';
import Nav from './Nav';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Search() {
    const [searchMethod, setSearchMethod] = useState('text')
    return (
        <div>
            <Nav isHome={false} isSearch={true}/>
            <div className='h-[10vh] flex flex-col justify-center items-center w-screen'>
                <div className='h-[7vh] w-[16vw]  bg-yellow-500 flex justify-center items-center shadow-md rounded-md'>

                    <Link to='/' className='h-[7vh]'>
                        <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{}}/>

                    </Link>
                        <h1 className='text-3xl font-mono'>Search Posts</h1>

                </div>
            </div>

            <br />
            <p>
                Search by&nbsp;
                <button onClick={() => setSearchMethod('voice')}>voice</button>&nbsp;
                or&nbsp;
                <button onClick={() => setSearchMethod('text')}>text</button>
            </p>
            <br />

            <InstantSearch searchClient={searchClient} indexName='all_posts'>
                <p>Filter postings from the current search context using a price range:</p>
                <RangeInput 
                    attribute='price'
                />
                <br />
                <p>Most relevant categories of item postings from the current search context:</p>
                <RefinementList
                    attribute='categories'
                    operator='and'
                />
                {/* refinement list and range input are affecting each other */}
                <br />
                {
                    searchMethod === 'text' ? (
                        <SearchBox searchAsYouType={false} showLoadingIndicator={true}/>
                    ) : (
                        <VoiceSearch searchAsYouSpeak={false} showLoadingIndicator={true}/>
                    )
                }
                <Hits hitComponent={Hit}/>
                <Pagination 
                    padding={5}
                />
            </InstantSearch>
        </div>
    )
}

export default Search