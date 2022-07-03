import { useState, React } from 'react'
import Nav from './Nav'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import { Link } from 'react-router-dom'

//firebase and redux imports
import {db, auth} from "./Firebase"
import {createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword} from "firebase/auth"
import {setDoc, doc} from 'firebase/firestore'
import { useDispatch } from 'react-redux/es/exports'
import { login } from '../features/userSlice'


const HomePage = () => {

    const [setup, setMode] = useState('home');
    const [registerName, setName] = useState('');
    const [registerEmail, setEmail] = useState('');
    const [registerPass, setPass] = useState('');
    const [verifiedRegisterPass, setVerifiedRegisterPass] = useState('')
    const dispatch = useDispatch()

    function setRegister() {
        setMode('register')
    }
    function setLogin() {
        setMode('login')
    }
    function setHome() {
        setMode('home')
    }
    function handleName(e) {
        setName(e.target.value)
    }
    function handleEmail(e) {
        setEmail(e.target.value)
    }
    function handlePass(e) {
        setPass(e.target.value)
    }

    function handleRegister() {
        if (!registerName){
            return alert('Please enter a full name!')
        }
        if (registerPass !== verifiedRegisterPass){
            return alert('Passwords do not match!')
        }

        createUserWithEmailAndPassword(auth, registerEmail, registerPass)
        .then((userAuth) => {
            updateProfile(userAuth.user, {
                displayName: registerName,
            })
            .then(login({
                email: userAuth.user.email,
                uid: userAuth.user.uid,
                displayName: registerName
            }))

            //initialize subcollections and collections for data organization
            setDoc(doc(db, "userData", userAuth.user.email), {
                uid: userAuth.user.uid,
                name: registerName
            })
            setDoc(doc(db, "users", userAuth.user.uid), {});
            setDoc(doc(db, 'users/'+userAuth.user.uid+'/contactList', 'list'), {contacts: []})         
        }).catch(error => alert(error))
    }

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    function handleLoginEmail(e) {
        setLoginEmail(e.target.value)
    }
    function handleLoginPass(e) {
        setLoginPass(e.target.value)
    }

    function handleLogin(e) {
        e.preventDefault()

        signInWithEmailAndPassword(auth, loginEmail, loginPass)
        .then(userAuth => {
            dispatch(login({
                email: userAuth.user.email,
                uid: userAuth.user.uid,
                displayName: userAuth.user.displayName
            }))
        }).catch(error => alert(error))
    }


  return (
    <div className='flex-col h-screen'>
        <Nav />
        <div className='h-[87vh] flex justify-center items-center'>
            <img src='https://img.freepik.com/free-vector/flat-geometric-background_23-2148957201.jpg?w=2000' className='object-cover h-full w-full'/>
            {
                setup == 'home' ?
                <div className='absolute h-[35vh] w-[30vw] bg-slate-50 drop-shadow-lg rounded-xl flex items-center flex-col'>
                    <h1 className=' text-3xl font-mono mt-[2vh]'>Welcome!</h1>
                    <h1 className=' text-xl font-mono '>get started</h1>
                    <Button variant="contained" className="" style={{ backgroundColor: "#09065c"}} sx={{ marginTop: "3%", width: "80%" }} onClick={setRegister}>New? Register</Button>
                    <Button onClick={setLogin} variant="contained" className="" style={{ backgroundColor:      "#09065c"}} sx={{ marginTop: "3%", width: "80%" }}>Login</Button>
                </div>
                
                : setup == 'register' ? //YO PUT THE 2 TIME PASSWORD TYPING
                <div className='absolute h-[70vh] w-[30vw] bg-slate-50 drop-shadow-lg rounded-xl flex items-center flex-col'>
                    <Button onClick={setHome} className='absolute shadow-md' style={{ backgroundColor: "#000000", color: "#ffffff", marginRight: "70%", marginTop: "5%"}}><ArrowBackIcon style={{}}/></Button>
                    <h1 className=' text-3xl font-mono mt-[2vh]'>Register</h1>
                    <h1 className=' text-xl font-mono '>enter your info!</h1>
                    <TextField
                        label="Full Name"
                        variant="standard"
                        sx={{ width: "70%", marginTop: "5%" }}
                        value={registerName}
                        onChange={handleName}
                    />
                    <TextField
                        label="email"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                <AccountCircle />
                                </InputAdornment>
                            ),
                            }}
                            sx={{ width: "70%", marginTop: "2%" }}
                            className='font-mono'
                        variant="standard"
                        value={registerEmail}
                        onChange={handleEmail}
                    />
                    <TextField
                        label="Password (at least 6 characters)"
                            sx={{ width: "70%", marginTop: "2%" }}
                        variant="standard"
                        type="password"
                        value={registerPass}
                        onChange={handlePass}
                    />
                    <TextField
                        label="Re-enter password"
                            sx={{ width: "70%", marginTop: "2%" }}
                        variant="standard"
                        type="password"
                        value={verifiedRegisterPass}
                        onChange={e => setVerifiedRegisterPass(e.target.value)}
                    />
                    <Button variant="contained" className="" style={{ backgroundColor: "#e39f00"}} onClick={handleRegister} sx={{ marginTop: "7%", width: "70%" }} >
                        Register
                    </Button>
                </div> :
                <div className='absolute h-[60vh] w-[30vw] bg-slate-50 drop-shadow-lg rounded-xl flex items-center flex-col'>
                    <Button onClick={setHome} className='absolute shadow-md' style={{ backgroundColor: "#000000", color: "#ffffff", marginRight: "70%", marginTop: "5%"}}><ArrowBackIcon style={{}}/></Button>
                    <h1 className=' text-3xl font-mono mt-[2vh]'>Login</h1>
                    <h1 className=' text-xl font-mono '>forgot password coming soon!</h1>
                    <TextField
                        label="email"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                <AccountCircle />
                                </InputAdornment>
                            ),
                            }}
                            sx={{ width: "70%", marginTop: "2%" }}
                            className='font-mono'
                        variant="standard"
                        value={loginEmail}
                        onChange={handleLoginEmail}
                    />
                    <TextField
                        label="password"
                            sx={{ width: "70%", marginTop: "2%" }}
                        variant="standard"
                        type="password"
                        value={loginPass}
                        onChange={handleLoginPass}
                    />
                    <Button variant="contained" className="" style={{ backgroundColor: "#62a3a6"}} onClick={handleLogin} sx={{ marginTop: "7%", width: "70%" }} >
                        Login
                    </Button>
                </div>
            }
            <Link
                to="/LearnMore" className='absolute ml-[85vw] mt-[73vh]'>
                <Button className='absolute shadow-md' sx={{}} style={{backgroundColor: "#2e82d1", color: "#ffffff", borderRadius: 30}}>
                    <HelpIcon sx={{mr: 1}}/>
                    Learn More
                
                </Button>
            </Link>
        </div>
    </div>
  )
}

export default HomePage