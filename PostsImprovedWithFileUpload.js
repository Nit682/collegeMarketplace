import React, { useState, useEffect } from 'react'
import {collection, getDocs, addDoc} from 'firebase/firestore'
import {db} from './Firebase'
//import Itempost from './Itempost'
import { storage } from './Firebase';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import ItempostFunctional from './ItempostFunctional';
import { useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';

function PostsImprovedWithFileUpload() {
    //get user from redux core
    const user = useSelector(selectUser)

    //creating a state to hold the textual form data
    const [formData, setFormData] = useState(
        {
            email: "",
            phoneNumber: "",
            price: 0,
            school: "",
            city: ""
        }
    )
    const [posts, setPosts] = useState([])

    const [imgUrl, setImgUrl] = useState([]);
    const [progresspercent, setProgresspercent] = useState(0);

    // state to know if the upload was successful so that the upload button can be removed so that the user cannot upload anymore in that post,
    // forcing them to reload. If user accidentally uploads an image and then reuploads another image without reloading, both images would show 
    // up in the post. So we remove the upload button component, forcing the user to reload if they made a mistake in uploading images so that
    // the image list is reset
    const [successfulUpload, setSuccessfulUpload] = useState(false)

    
    //information about the post when user is authenticated
    const pfpImage = user.profileUrl
    const userName = user.displayName

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

    //the function called to update the formData object whenever input in the textual form changes state
    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        })
    }

    //loops through the images selected and sends them to the db
    const handleUpload = (e) => {
        e.preventDefault()
        const files = e.target[0]?.files
        if (files.length === 0){
          alert("Please upload at least one image to your post.")
          return;
        }
        
        for (let i = 0; i < files.length; i++){
          const file = files[i]
          const storageRef = ref(storage, `files/${file.name}`)
          const uploadTask = uploadBytesResumable(storageRef, file)

          uploadTask.on("state_changed",
            (snapshot) => {
              const progress =
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setProgresspercent(progress);
            },
            (error) => {
              alert(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setImgUrl(prevURL => {
                  if (prevURL.includes(downloadURL)){
                    return prevURL
                  }
                  prevURL.push(downloadURL)
                  console.log(downloadURL)
                  return prevURL
                })
              });
            }
          ); 
        }
        alert("Your "+files.length+" images were successfully uploaded. Please continue creating your post.")
        setSuccessfulUpload(prevSuccessfulUpload => !prevSuccessfulUpload)
    }

    //sends text information to firebase as a formatted object that is readable to the Itempost component when retrieved from db
    function handleSubmit(event) {
        event.preventDefault()
        
        if (successfulUpload === false) {
          alert("Please upload at least one image to your post.")
          return;
        }
        console.log(imgUrl)
        const postDataCollectionRef = collection(db, 'posts')
        addDoc(postDataCollectionRef, {
            userpfp: pfpImage,
            userName: userName,
            itemPictureList:imgUrl,
            contact: {
              email:formData.email,
              phoneNumber:formData.phoneNumber
            },
            price:formData.price,
            likeCount:0,
            school:formData.school,
            listedCity:formData.city,
            availabilityStatus:true,
            categories:["furniture"],
        })
        alert("You have successfully created a new post! Please reload this page.")
        setFormData(prevFormData => {
          return {
            email: "",
            phoneNumber: "",
            price: 0,
            school: "",
            city: ""
          }
        })
        
    }

    //maps through the post objects from firebase and renders the ones that meet filter reqs as Itempost components
    function getPostComponentsMeetingFilterConstraints(lowerPriceBound, upperPriceBound, category, school, userListedBy){
        return(
          posts.map(post => {

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

            return <ItempostFunctional 
              key={post.id} 
              listedID={post.id} 
              data={post.data} 
            />
          })
        )
    }

    return (
        //creating two forms to upload images and submit text info
        <div>
            <h2>Create a new post</h2>

            <br />
            {/* When upload button is pressed, the files are sent to firebase */}
            <h1>Choose pictures for your post</h1>
            <div>
                <form onSubmit={handleUpload} className='form'>
                    <input type='file' multiple required/>
                    {!successfulUpload && <button type='submit'>Upload</button>}
                </form>
                {
                    !imgUrl &&
                    <div className='outerbar'>
                    <div className='innerbar' style={{ width: `${progresspercent}%` }}>{progresspercent}%</div>
                    </div>
                }
            </div>
            <br />

            {/* Keeps track of a form data object state that updates its attributes due to changes in these input elements */}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                    required
                />
                <br />
                <input
                    type="phoneNumber"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    required
                />
                <br />
                <input
                    type="price"
                    placeholder="Price"
                    onChange={handleChange}
                    name="price"
                    value={formData.price}
                    required
                />
                <br />
                <input
                    type="school"
                    placeholder="Institution"
                    onChange={handleChange}
                    name="school"
                    value={formData.school}
                    required
                />
                <br />
                <input
                    type="city"
                    placeholder="City"
                    onChange={handleChange}
                    name="city"
                    value={formData.city}
                    required
                />

                {/* When the submit button is pressed, the text data is sent to firebase as a post object */}
                <br />
                <br />
                <button>Submit</button>
                <br />
                <br />
            </form>
            {/* Retrieves all post objects in the database and renders them as Itempost components if they meet filters */}
            {getPostComponentsMeetingFilterConstraints(null, null, null, null, null)}
        </div>
    )
}

export default PostsImprovedWithFileUpload