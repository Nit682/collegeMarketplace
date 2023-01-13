import { React, useState, useEffect } from 'react'
import Nav from './Nav'
import Button from '@mui/material/Button';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PaidIcon from '@mui/icons-material/Paid';
import BrushIcon from '@mui/icons-material/Brush';
import DescriptionIcon from '@mui/icons-material/Description';
import {Stack, Autocomplete} from '@mui/material'
import InputBase from '@mui/material/InputBase';


//backend imports
import { Link, useNavigate } from 'react-router-dom'
import { serverTimestamp } from "firebase/firestore";
import {collection, addDoc, setDoc, doc} from 'firebase/firestore'
import {db, storage, useAuth} from '../backend-configurations/Firebase-config'
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import axios from 'axios';
import { searchIndex } from '../backend-configurations/Algolia';

function NewPostForm() {
    //authentication variables
    const user = useAuth()
    const sessionUserID = user.uid
    const sessionUserName = user.displayName
    const sessionUserEmail = user.email

    //router DOM variables
    let navigate = useNavigate()

    //form state variables
    const [emailEntered, setEmailEntered] = useState('')
    const [phoneNumberEntered, setPhoneNumberEntered] = useState('')
    const [priceEntered, setPriceEntered] = useState(null)
    const [descriptionEntered, setDescriptionEntered] = useState('')
    const [schoolEntered, setSchoolEntered] = useState('')
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedItemNames, setSelectedItemNames] = useState([])
    const [itemNameOptions, setItemNameOptions] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)
    const [imageFiles, setImageFiles] = useState([])

    //autocomplete suggestion state variables
    const [apiExtractionOfAmericanColleges, setAPIExtractionOfAmericanColleges] = useState([])
    const [schoolSuggestions, setSchoolSuggestions] = useState([])

    //form input size restrictions
    const categoryAndItemNameSizeLimit = 81
    const descriptionSizeLimit = 48

    //extract American colleges from API as soon as initial load
    useEffect(() => {
        const loadAmericanColleges = async () => {
            const response = await axios.get('https://gist.githubusercontent.com/hakimelek/147f364c449104ba66da9a3baca9d0c0/raw/7e914fc578d3176f1f752f571f5b3761ea2b22fa/us_institutions.json')
            const collegesJSON = response.data
            const collegeNames = collegesJSON.map(object => object.institution)
            setAPIExtractionOfAmericanColleges(collegeNames)
        }
        loadAmericanColleges()
    }, [])

    //validate form data and send to firestore
    function handleSubmit(event){
        event.preventDefault()

        //validate phone number entered
        const phoneNumberEnteredAsNumberType = Number(phoneNumberEntered)
        if (!(phoneNumberEntered.length === 10 && Number.isInteger(phoneNumberEnteredAsNumberType) && phoneNumberEnteredAsNumberType > 0)){
            return alert('Enter valid phone number. Example: 4892347639')
        }

        //validate price entered
        if (isNaN(priceEntered)){
            return alert('Enter valid price. Example: 4.00')
        } else if (parseFloat(priceEntered) < 0.00){
            return alert('Enter valid price. Example: 4.00')
        }

        //validate school entered
        if (!schoolEntered){
            return alert('Use suggestions to find your institution.')
        }

        //validate size of description entered
        if (descriptionEntered.length  > descriptionSizeLimit){
            return alert('Your description is too large.')
        }

        //validate size of item names and categories accounting for commas and characters
        const isCategoryAndItemNameSizeTooLarge = () => {
            let size = 0
            for (let i = 0; i < selectedCategories.length; i++){
                size += selectedCategories[i].length
            }
            for (let i = 0; i < selectedItemNames.length; i++){
                size += selectedItemNames[i].length
            }
            return size + 2*(selectedCategories.length - 1) + 2*(selectedItemNames.length - 1) > categoryAndItemNameSizeLimit
        }
        if (isCategoryAndItemNameSizeTooLarge()){
            return alert ('Categories and/or item name(s) are too large.')
        }

        //validate images submitted
        //const files = event.target[0]?.files
        const files = imageFiles
        if (!files || files.length === 0){
            return alert('Please upload at least one image for your post.')
        }

        //send images to firebase storage and get their cloud links
        let imgURLpromiseList = []
        let imgReferences = []
        for (let i = 0; i < files.length; i++){
            const file = files[i]
            const imgRef = ref(storage, `files/${sessionUserID}/${file.name}`)
            imgReferences.push(`files/${sessionUserID}/${file.name}`)
            
            //uploading each image and getting their cloud url in promises
            const cloudURLpromise = uploadBytes(imgRef, file).then(() => {
                return getDownloadURL(imgRef).then(url => url)
            })
            imgURLpromiseList.push(cloudURLpromise)
        }

        //extract promises containing cloud urls
        //then sending form data and cloud urls to create post data entries in firestore
        const promiseExtract = async () => {
            let cloudURLlist = []
            for (let i = 0; i < imgURLpromiseList.length; i++){
                const cloudURLpromise = await imgURLpromiseList[i]
                cloudURLlist.push(cloudURLpromise)
            }

            //creating a user document if not created already
            await setDoc(doc(db, 'users', sessionUserID), {})

            const all_postsCollectionRef = collection(db, `users/${sessionUserID}/all_posts`)
            
            //processing undefined or null data before firestorage
            let postUsername = sessionUserEmail
            if (sessionUserName){
                postUsername = sessionUserName
            }
            let postItemNames = selectedItemNames
            if (selectedCategories.length === 0){
                postItemNames = []
            }
            
            //adding post data to a document part of all_posts collection in firestore
            const docRef = await addDoc(all_postsCollectionRef, {
                userName: postUsername,
                pfp: '',
                itemPictureList:cloudURLlist,
                itemPictureListRefs:imgReferences,
                contact:{
                    email:emailEntered,
                    phoneNumber:phoneNumberEntered
                },
                price:parseFloat(priceEntered),
                likeCount:0,
                school:schoolEntered,
                availabilityStatus:true,
                categories:selectedCategories,
                itemNameList:postItemNames,
                description:descriptionEntered,
                timestamp:serverTimestamp()
            })
            //once added to firebase, getting doc path to add to public search bank in algolia
            searchIndex.saveObject({
                objectID:docRef.id,
                path:docRef.path,
                userName: postUsername,
                contact:{
                    email:emailEntered,
                    phoneNumber:phoneNumberEntered
                },
                price:parseFloat(priceEntered),
                school:schoolEntered,
                categories:selectedCategories,
                itemNameList:postItemNames,
            }, { autoGenerateObjectIDIfNotExist: true })
        }
        promiseExtract()
        //redirect or reroute to /myposts
        navigate('/myposts')
    }

    //making an image preview
    useEffect(() => {
        if (selectedImage){
            setImageUrl(URL.createObjectURL(selectedImage))
        }
    }, [selectedImage])

    return (
        <div className='flex flex-col h-screen items-center'>
        <Nav isHome={false} isSearch={false}/>
            
            

        <div className='h-[87vh] flex flex-col justify-center items-center w-screen'>

            <div className='h-[7vh] w-[16vw]  bg-yellow-300 flex justify-evenly items-center shadow-md rounded-md'>

                <Link to='/' className='h-[7vh]'>
                    <ArrowBackIcon className='' sx={{ height: "100%" }} style={{}}/>

                </Link>
                    <h1 className='text-3xl font-mono'>New Post</h1>

            </div>

            <div className='mt-[2vh] h-[68vh] w-[80vw] shadow-md rounded-xl flex items-center justify-around'>

            <div className='flex flex-col items-center'>
                    <input type='file' style={{ display: 'none'}} multiple required id="select-image" className='absolute' onChange={e => {
                        setSelectedImage(e.target.files[0])
                        setImageFiles(e.target.files)
                    }}/>
                    <label htmlFor='select-image' className='w-[25vw]'>
                        <Button style={{ backgroundColor: '#070766', width: "100%" }} variant="contained" component="span">
                            <CameraAltIcon />
                        </Button>
                    </label>
                    {imageUrl ? selectedImage && (
                        <div className='h-[45vh] w-[25vw] rounded-xl'>
                            <img src={imageUrl} alt={selectedImage.name} className='mt-[2vh] object-contain h-full w-full rounded-lg'/>
                        </div>
                    )
                    :
                    <div className='h-[45vh] w-[25vw] rounded-xl shadow-xl'>
                            <img src='https://www.peacemakersnetwork.org/wp-content/uploads/2019/09/placeholder.jpg' alt='img' className='mt-[2vh] object-cover h-full w-full rounded-lg'/>
                        </div>
                }

            </div>

            {/* Keeps track of a form data object state that updates its attributes due to changes in these input elements */}
            <div className='bg-amber-300 h-[57vh] rounded-lg shadow-md flex items-center justify-center gap-[5vw] overflow-auto w-[47vw]
'>
            <div className='flex flex-col w-[18vw] h-[46vh]'>
                
            <input className='shadow-md border-none h-[10vh] w-full outline-none bg-slate-100 rounded-lg p-3' placeholder='email' onChange={(e) => setEmailEntered(e.target.value)}
            required
                    value={emailEntered}/>
                
                <input className='shadow-md mt-[2vh] border-none h-[10vh] w-full outline-none bg-slate-100 rounded-lg p-3' placeholder='price' onChange={(e) => setPriceEntered(e.target.value)}
                required
                    value={priceEntered}/>   
                
                <div className='shadow-md mt-[2vh] border-none min-h-[10vh] max-h-[20vh] outline-none bg-slate-100 rounded-lg p-3 overflow-auto'>
                    <Stack spacing={3} sx={{ width: 'full' }}>
                        <Autocomplete
                            onChange={(event, newVal) => {
                                setSelectedCategories(newVal);
                            }}
                            multiple
                            options={[
                                "Room Needs/Storage", "Linens/Laundry Supplies", "Office/Desk Supplies",
                                "Electronics", "Shared Items","Toiletries", "Clothing", "Household and Kitchen Items",
                                "Miscellaneous"
                            ]}
                            getOptionLabel={(option) => option}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    variant='standard'
                                    {...params}
                                    placeholder="category"
                                />
                            )}
                        />
                    </Stack>
                </div>

                {
                selectedCategories.length > 0 && (
                    <div className='shadow-md mt-[2vh] border-none min-h-[10vh] max-h-[20vh] outline-none bg-slate-100 rounded-lg p-3 overflow-auto'>
                        <Stack spacing={3} sx={{ width: 'full' }}>
                            <Autocomplete
                                onChange={(event, newVal) => setSelectedItemNames(newVal)}
                                onInputChange={(event, newInputValue) => setItemNameOptions([newInputValue])}
                                multiple
                                options={itemNameOptions}
                                getOptionLabel={(option) => option}
                                filterSelectedOptions
                                aria-required
                                renderInput={(params) => (
                                    <TextField
                                        variant='standard'
                                        {...params}
                                        placeholder="next item"
                                    />
                                )}
                            />
                        </Stack>
                    </div>
                )
            }
                
                

                {/* When the submit button is pressed, the text data is sent to firebase as a post object */}

                


            </div>
            <div className='flex flex-col w-[18vw] drop-shadow-md '>
                <input className='shadow-md border-none h-[10vh] outline-none bg-slate-100 rounded-lg p-3' placeholder='phone' onChange={(e) => setPhoneNumberEntered(e.target.value)}
                    value={phoneNumberEntered}
                    required
                />
                <div className='shadow-md mt-[2vh] border-none h-[10vh] outline-none bg-slate-100 rounded-lg p-3'>
                <Autocomplete
                    value={schoolEntered}
                    onChange={(event, newVal) => setSchoolEntered(newVal)}
                    onInputChange={(event, newInputVal) => {
                        if (newInputVal.length > 0){
                            let regexMatches = apiExtractionOfAmericanColleges.filter(college => {
                                const regex = new RegExp(`${newInputVal.toLowerCase()}`, 'gi')
                                return college.toLowerCase().match(regex)
                            })
                            setSchoolSuggestions(regexMatches)
                        }
                    }}
                    id="controllable-states-demo"
                    options={schoolSuggestions}
                    sx={{ width: 'full', border: 'none', outline: 'none' }}
                    renderInput={(params) => <TextField variant='standard' required {...params} placeholder="school"/>}
                    //<InputBase required {...params} placeholder="school"/>
                    //renderInput={(params) => <TextField required {...params} placeholder="school" />}
                />
                </div>

                <input className='shadow-md mt-[2vh] border-none h-[10vh] outline-none bg-slate-100 rounded-lg p-3' placeholder='description' onChange={(e) => setDescriptionEntered(e.target.valeu)}
                    value={descriptionEntered}
                    required
                />
                <button onClick={handleSubmit} className=' bg-yellow-500 h-[10vh] mt-[2vh] rounded-lg transition-all duration-100 ease-linear hover:bg-yellow-600 shadow-md hover:shadow-xl'>
                    <div className='h-[6vh] flex justify-center items-center'>
                        <BrushIcon />
                    </div>
                </button>

                
            </div>
            </div>

            </div>
        </div>
        </div>
    )
}

export default NewPostForm