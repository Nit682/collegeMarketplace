import { useState, React } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import { Link } from 'react-router-dom'
import Nav from './Nav';

//backend imports
import {registerWithGoogle} from '../backend-configurations/Firebase-config'

export default function HomePage() {
    return (
        <div className='flex-col h-screen'>
            <Nav isHome={true} isSearch={false} />
            <div className='h-[87vh] flex justify-center items-center'>
                <img src='https://img.freepik.com/free-vector/flat-geometric-background_23-2148957201.jpg?w=2000' className='object-cover h-full w-full'/>
                <div className='absolute h-[35vh] w-[30vw] bg-slate-50 drop-shadow-lg rounded-xl flex items-center flex-col'>
                    <h1 className=' text-3xl font-mono mt-[2vh]'>Welcome!</h1>
                    <h1 className=' text-xl font-mono '>get started</h1>
                    <Button variant="contained" className="" style={{ backgroundColor: "#09065c"}} sx={{ marginTop: "3%", width: "80%" }} onClick={registerWithGoogle}>New? Register with Google</Button>
                    <Button onClick={registerWithGoogle} variant="contained" className="" style={{ backgroundColor:      "#09065c"}} sx={{ marginTop: "3%", width: "80%" }}>Login with Google</Button>
                </div>
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