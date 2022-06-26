import React, {useState} from 'react'
import { useDispatch } from 'react-redux/es/exports'
import { login } from './features/userSlice'
import "./Login.css"
import {auth} from "./Firebase"
import {createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword} from "firebase/auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [profilePic, setProfilePic] = useState("")
  const dispatch = useDispatch()

  console.log(name,' ',profilePic)

  const logoSrc = "data:image/png;base64,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"
  const register = () => {
    if (!name){
        return alert('Please enter a full name!')
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((userAuth) => {
        updateProfile(userAuth.user, {
            displayName: name,
            photoURL: profilePic
        })
        .then(() => {
            dispatch(login({
                email: userAuth.user.email,
                uid: userAuth.user.uid,
                displayName: name,
                photoUrl: profilePic
            }))
        })
    }).catch(error => alert(error))
  }
  const loginToApp = (e) => {
    e.preventDefault()

    signInWithEmailAndPassword(auth, email, password)
    .then(userAuth => {
        dispatch(login({
            email: userAuth.user.email,
            uid: userAuth.user.uid,
            displayName: userAuth.user.displayName,
            profileUrl: userAuth.user.photoURL
        }))
    }).catch(error => alert(error))
  }
  return (
    <div className="login">
        <img src={logoSrc} alt=""/>

        <form>
            <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name (required if registering)" 
                type="text"
            />

            <input 
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder='Profile pic URL (optional)' 
                type="text"
            />
        
            <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder='Email' 
                type="email"
            />

            <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password' 
                type='password'
            />

            <button type='submit' onClick={loginToApp}>Sign In</button>
        </form>

        <p>Not a member?{" "}
            <span className='login__register' onClick={register}>Register Now</span>
        </p>
    </div>
  )
}

export default Login