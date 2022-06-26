import React, { useState, useEffect } from 'react'
import {collection, getDocs, addDoc} from 'firebase/firestore'
import {db} from './Firebase'
import Itempost from './Itempost'

function PostsImproved() {
    const [formData, setFormData] = useState(
        {
            email: "",
            phoneNumber: "",
            itemPics: "",
            price: 0,
            school: "",
            city: ""
        }
    )
    const [posts, setPosts] = useState([])
    
    //information about the post when user is authenticated
    const pfpImage = "https://static.wixstatic.com/media/1a2d56_17e40617901c4597835abe19462fbc6a~mv2.jpg/v1/crop/x_0,y_30,w_768,h_964/fill/w_304,h_390,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG-20200628-WA0000_JPG.jpg"
    const userName = "Nitish Vobilisetti"

    useEffect(() => {
        const postDataCollectionRef = collection(db, 'posts')
        getDocs(postDataCollectionRef).then(response =>{
            const fbposts = response.docs.map(doc => ({
                data: doc.data(),
                id: doc.id,

            }))
            setPosts(fbposts)
        }).catch(error => console.log(error.message))
    }, [])

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        })
    }

    function handleSubmit(event) {
        event.preventDefault()

        const postDataCollectionRef = collection(db, 'posts')
        addDoc(postDataCollectionRef, {
            userpfp: pfpImage,
            userName: userName,
            itemPictureList:[formData.itemPics],
            contact: {
              email:formData.email,
              phoneNumber:formData.phoneNumber
            },
            price:formData.price,
            likeCount:0,
            isLikedByUserInitially:false,
            isMarkedInProgressInitially:false,
            school:formData.school,
            listedCity:formData.city,
            availabilityStatus:true,
            categories:["furniture"],
        })
    }

    function getPostComponentsMeetingFilterConstraints(lowerPriceBound, upperPriceBound, category, school, userListedBy){
        return(
          posts.map(post => {
            console.log(post)
            if (userListedBy){
              if (userListedBy !== post.data.userName){
                return null
              }
            }
    
            if (upperPriceBound && lowerPriceBound){
              if ((post.data.price >= lowerPriceBound && post.data.price <= upperPriceBound) === false){
                return null
              }
            }
            if (school){
              if (school !== post.data.school){
                return null
              }
            }
            if (category){
              for (let i = 0; i < category.length; i++){
                if (post.data.categories.includes(category[i]) === true){
                  break
                }
              }
            }
            
            return <Itempost key={post.id} data={post.data} />
          })
        )
    }

    return (
        <div>
            <h2>Create a new post</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                />
                <br />
                <input
                    type="phoneNumber"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                />
                <br />
                <input
                    type="itemPics"
                    placeholder="Items"
                    onChange={handleChange}
                    name="itemPics"
                    value={formData.itemPics}
                />
                <br />
                <input
                    type="price"
                    placeholder="Price"
                    onChange={handleChange}
                    name="price"
                    value={formData.price}
                />
                <br />
                <input
                    type="school"
                    placeholder="Institution"
                    onChange={handleChange}
                    name="school"
                    value={formData.school}
                />
                <br />
                <input
                    type="city"
                    placeholder="City"
                    onChange={handleChange}
                    name="city"
                    value={formData.city}
                />

                <br />
                <br />
                <button>Submit</button>
                <br />
                <br />
            </form>
            
            {getPostComponentsMeetingFilterConstraints(null, null, null, null, null)}
        </div>
    )
}

export default PostsImproved