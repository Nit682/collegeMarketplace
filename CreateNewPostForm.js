import {useState, React, useEffect} from 'react'
import Nav from './Nav'
import Button from '@mui/material/Button';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import MapIcon from '@mui/icons-material/Map';
import BrushIcon from '@mui/icons-material/Brush';

//backend imports
import {collection, addDoc, setDoc, doc} from 'firebase/firestore'
import {db} from './Firebase'
import { storage } from './Firebase';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';

const CreateNewPostForm = () => {
    const user = useSelector(selectUser)
    const [formData, setFormData] = useState(
        {
            email: "",
            phoneNumber: "",
            price: 0,
            school: "",
            city: ""
        }
    )
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    //Nitish constants
    const userName = user.displayName

    function handleSubmit(event) {
        event.preventDefault()
        const files = event.target[0]?.files
        if (files.length === 0){
            return alert('Please upload at least one image for your post.')
        }

        let url_list = []
        for (let i = 0; i < files.length; i++){
            const file = files[i]

            const imgRef = ref(storage, `files/${file.name}`)
            const result = uploadBytes(imgRef, file).then(() => {
                const downloadUrl = getDownloadURL(imgRef).then(url => {
                    return url
                })
                return downloadUrl
            })
            url_list.push(result)
        }

        const promiseExtract = async () => {
            let extractedList = []
            for (let i = 0; i < url_list.length; i++){
              const url = await url_list[i]
              extractedList.push(url)
            }

            setDoc(doc(db, "users", user.uid), {});
  
            const r = collection(db, 'users/'+user.uid+'/all_posts')
            addDoc(r, {
                userName: userName,
                pfp: "",
                itemPictureList:extractedList,
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
        promiseExtract()
        return alert('You have successfully created a new post!')

        

        // console.log(files.length)
        // const imgUrl_list = []
        // for (let i = 0; i < files.length; i++){
        //     const file = files[i]
        //     const storageRef = ref(storage, `files/${file.name}`)

        //     const uploadTask = uploadBytesResumable(storageRef, file)

        //     uploadTask.on("state_changed",
        //         (snapshot) => {
        //             const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        //             setProgresspercent(progress);
        //         },
        //         (error) => {
        //             alert(error);
        //         },
        //         () => {
        //             const imgurl_promiseObj = getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        //                 return downloadURL
        //             });
        //             if (!imgUrl_list.includes(imgurl_promiseObj)){
        //                 imgUrl_list.push(imgurl_promiseObj)
        //             }
        //         }
        //     );
        //     console.log(imgUrl_list.length)
        // }
        // setImgUrl(imgUrl_list)
    }

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        })
    }
    

    useEffect(() => {
        if (selectedImage) {
          setImageUrl(URL.createObjectURL(selectedImage));
        }
      }, [selectedImage]);

    return (
        <div className='flex flex-col h-screen items-center'>
            <Nav />
            <div className='h-[87vh] flex flex-col justify-center items-center w-screen'>
                <div className='h-[7vh] w-[16vw]  bg-yellow-500 flex justify-center items-center shadow-md rounded-md'>

                    <Link to='/' className='h-[7vh]'>
                        <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{}}/>

                    </Link>
                        <h1 className='text-3xl font-mono'>New Post</h1>

                </div>

                <form onSubmit={handleSubmit}>
                    <div className='mt-[2vh] h-[68vh] w-[52vw] shadow-md rounded-xl flex flex-col items-center'>

                        <div className='absolute mt-[4vh] mr-[22vw] flex flex-col items-center '>
                                <input type='file' style={{ display: 'none'}} multiple required id="select-image" className='absolute' onChange={e => setSelectedImage(e.target.files[0])}/>
                                <label htmlFor='select-image' className='w-[25vw]'>
                                    <Button style={{ backgroundColor: '#070766', width: "100%" }} variant="contained" component="span">
                                        <CameraAltIcon />
                                    </Button>
                                </label>
                                {imageUrl ? selectedImage && (
                                    <div className='h-[45vh] w-[25vw] rounded-xl'>
                                        <img src={imageUrl} alt={selectedImage.name} className='mt-[2vh] object-fill h-full w-full rounded-lg'/>
                                    </div>
                                )
                                :
                                <div className='h-[45vh] w-[25vw] rounded-xl shadow-xl'>
                                        <img src='https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg' alt='img' className='mt-[2vh] object-fill h-full w-full rounded-lg'/>
                                    </div>
                            }

                        </div>

                        {/* Keeps track of a form data object state that updates its attributes due to changes in these input elements */}
                        <div className='absolute ml-[27vw] mt-[2vh] flex flex-col w-[20vw] h-[50vh]'>
                            <TextField
                                label="email"
                                name="email"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <AccountCircle />
                                        </InputAdornment>
                                    ),
                                    }}
                                    className='font-mono'
                                variant="outlined"
                                value={formData.email}
                                required
                                onChange={handleChange}
                            />

                            <TextField
                                label="phone"
                                name="phoneNumber"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <LocalPhoneIcon />
                                        </InputAdornment>
                                    ),
                                    }}
                                    className=''
                                    sx={{ marginTop: "5%" }}
                                variant="outlined"
                                value={formData.phoneNumber}
                                required
                                onChange={handleChange}
                            />
                            <TextField
                                label="price"
                                name="price"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <PaidIcon />
                                        </InputAdornment>
                                    ),
                                    }}
                                    className='font-mono'
                                    sx={{ marginTop: "5%" }}
                                variant="outlined"
                                value={formData.price}
                                required
                                onChange={handleChange}
                            />
                            <TextField
                                label="institution"
                                name="school"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <SchoolIcon />
                                        </InputAdornment>
                                    ),
                                    }}
                                    className='font-mono'
                                    sx={{ marginTop: "5%" }}
                                variant="outlined"
                                value={formData.school}
                                required
                                onChange={handleChange}
                            />
                            <TextField
                                label="city"
                                name="city"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <MapIcon />
                                        </InputAdornment>
                                    ),
                                    }}
                                    className='font-mono'
                                    sx={{ marginTop: "5%" }}
                                variant="outlined"
                                value={formData.city}
                                required
                                onChange={handleChange}
                            />


                            {/* When the submit button is pressed, the text data is sent to firebase as a post object */}

                            <button variant='contained' sx={{ marginTop: "5%", height: "15%" }} style={{ backgroundColor: "#32a852" }}>
                                <BrushIcon />
                            </button>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNewPostForm