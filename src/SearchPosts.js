import React, { useState, useEffect } from "react";
import "./SearchPosts.css";
import ItempostFunctional from "./ItempostFunctional";
import {db} from './Firebase'
import {collection, getDocs} from 'firebase/firestore'

function SearchPosts() {
    const[data, setData] = useState([])
    const[schoolSearchTerm, setSchoolSearchTerm] = useState("")
    const[citySearchTerm, setCitySearchTerm] = useState("")
    const[lowerPriceBound, setLowerPriceBound] = useState("")
    const[upperPriceBound, setUpperPriceBound] = useState("")
    const[nameSearchTerm, setNameSearchTerm] = useState("")
    const[phoneNumberSearchTerm, setPhoneNumberSearchTerm] = useState("")
    const[emailSearchTerm, setEmailSearchTerm] = useState("")
    const[isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        const ref = collection(db, 'users')
        getDocs(ref).then(response =>{
            //mapping through every user
            const fbposts = response.docs.map(doc => {
                const subRef = collection(db, 'users/'+doc.id+'/all_posts')
                const singleUserPosts = getDocs(subRef).then(subResponse => {
                    //mapping through each user's all_posts
                    return (
                        subResponse.docs.map(all_postsDoc => ({
                            data: all_postsDoc.data(),
                            id: all_postsDoc.id,
                            userID: doc.id
                        }))
                    )
                })
                return singleUserPosts
            })
            Promise.all(fbposts).then(function(values){
                setData(values)
            })
        }).catch(error => console.log(error.message))
    }, [])

    function getPostComponentsMeetingFilterConstraints(){
        if (data.length === 0){
            return;
        }
        let postComponentsList = []
        for (let i = 0; i < data.length; i++){
            const posts = data[i]
            posts.filter(post => {
                const school = post.data.school.toLowerCase()
                const city = post.data.listedCity.toLowerCase()
                const postPrice = parseFloat(post.data.price)
                const name = post.data.userName.toLowerCase()
                const phoneNumber = post.data.contact.phoneNumber.toLowerCase()
                const email = post.data.contact.email.toLowerCase()

                if (!(schoolSearchTerm || citySearchTerm || (upperPriceBound && lowerPriceBound) || nameSearchTerm || emailSearchTerm 
                || phoneNumberSearchTerm)){
                    return;
                }

                if (schoolSearchTerm){
                    if (!school.includes(schoolSearchTerm.toLowerCase())){
                        return;
                    }
                }
                if (citySearchTerm){
                    if (!city.includes(citySearchTerm.toLowerCase())){
                        return;
                    }
                }
                if ((lowerPriceBound && upperPriceBound)){
                    if (!(parseFloat(lowerPriceBound) <= postPrice && postPrice <= parseFloat(upperPriceBound))){
                        return;
                    }
                }
                if (nameSearchTerm){
                    if (!name.includes(nameSearchTerm.toLowerCase())){
                        return;
                    }
                }
                if (phoneNumberSearchTerm){
                    if (!phoneNumber.includes(phoneNumberSearchTerm.toLowerCase())){
                        return;
                    }
                }
                if (emailSearchTerm){
                    if (!email.includes(emailSearchTerm.toLowerCase())){
                        return;
                    }
                }
                return post
            }).map(post => {
                postComponentsList.push(<ItempostFunctional
                    key={post.id}
                    listedID={post.id}
                    data={post.data}
                    postOwnerID={post.userID}
                    componentWillBeReRenderedWithoutReload={true}
                />)
                console.log(post.userID)
            })
        }
        return postComponentsList
    }

    function handleSubmit(e){
        e.preventDefault()
        setIsSubmitted(true)
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <p>School Search</p>
                <input 
                    type="text" 
                    placeholder="Search by school..." 
                    onChange={(e) => {
                        setSchoolSearchTerm(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={schoolSearchTerm}
                />
                <br />
                <br />
                <p>City Search</p>
                <input 
                    type="text" 
                    placeholder="Search by city..." 
                    onChange={(e) => {
                        setCitySearchTerm(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={citySearchTerm}
                />
                <br />
                <br />
                <p>Price range in $</p>
                <input 
                    type="text" 
                    placeholder="Lower price bound..." 
                    onChange={(e) => {
                        setLowerPriceBound(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={lowerPriceBound}
                />
                <input 
                    type="text" 
                    placeholder="Upper price bound..." 
                    onChange={(e) => {
                        setUpperPriceBound(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={upperPriceBound}
                />
                <br />
                <br />
                <p>Seller Search</p>
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    onChange={(e) => {
                        setNameSearchTerm(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={nameSearchTerm}
                />
                <br />
                <input 
                    type="text" 
                    placeholder="Search by phone number..." 
                    onChange={(e) => {
                        setPhoneNumberSearchTerm(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={phoneNumberSearchTerm}
                />
                <br />
                <input 
                    type="text" 
                    placeholder="Search by email address..." 
                    onChange={(e) => {
                        setEmailSearchTerm(e.target.value)
                        setIsSubmitted(false)
                    }} 
                    value={emailSearchTerm}
                />
                <br />
                <br />
                <button>Search</button>
            </form>
            {isSubmitted && getPostComponentsMeetingFilterConstraints()}
        </div>
    );
}

export default SearchPosts;