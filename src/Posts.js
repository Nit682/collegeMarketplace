import React, { useState, useEffect } from 'react'
import {collection, getDocs} from 'firebase/firestore'
import {db} from './Firebase'
import Itempost from './Itempost'

function Posts(){
    //part of data retrieval
    const [postData, setPostData] = useState([])

    useEffect(() => {
        getPosts()
    }, [])

    //uses the postData from firebase to create a list of js objects that are easy to read
    function getPostDataObjects(){
        let postDataObjects = []
        for (let i = 0; i < postData.length; i++){
            for (let j = 0; j < postData[i].data.postData.length; j++){
                postDataObjects.push(postData[i].data.postData[j])
            }
        }
        return postDataObjects
    }

    //function returns an array of post components that match parameter filters
    function getPostComponentsMeetingFilterConstraints(lowerPriceBound, upperPriceBound, category, school, userListedBy){
        const arr = getPostDataObjects()
        return(
          arr.map(post => {
            
            if (userListedBy){
              if (userListedBy !== post.userName){
                return null
              }
            }
    
            if (upperPriceBound && lowerPriceBound){
              if ((post.price >= lowerPriceBound && post.price <= upperPriceBound) === false){
                return null
              }
            }
            if (school){
              if (school !== post.school){
                return null
              }
            }
            if (category){
              for (let i = 0; i < category.length; i++){
                if (post.categories.includes(category[i]) === true){
                  break
                }
              }
            }
            
            return <Itempost data={post} />
          })
        )
    }

    //part of data retrieval
    function getPosts(){
        const postDataCollectionRef = collection(db, 'postData')
        getDocs(postDataCollectionRef).then(response =>{
            const posts = response.docs.map(doc => ({
                data: doc.data(),
                id: doc.id,

            }))
            setPostData(posts)
        }).catch(error => console.log(error.message))
    }

    //render an array of multiple Itempost components and return them
    return(
        <div className='container mx-auto bg-gray-200 rounded-xl'>
            {
              //example of rendering with filters
              //getPostComponentsMeetingFilterConstraints(null,1.50,["furniture"],"University of Washington",null)

              getPostComponentsMeetingFilterConstraints()
            }
        </div>
    )
}

export default Posts