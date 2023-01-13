import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from 'firebase/auth'
import React, {useState, useEffect, useContext} from 'react'
import {getFirestore, doc, getDoc, setDoc} from 'firebase/firestore'
import { getStorage } from "firebase/storage";

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app);
export const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export const signInWithGoogle = () => {
    //signInWithPopup(auth, provider)
    registerWithGoogle()
}

export const registerWithGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
        const initializeUserData = async () => {
            const docRef = doc(db, "userData", result.user.email);
            const docSnap = await getDoc(docRef);
            console.log(docSnap.exists())
            if (!docSnap.exists()) {
                setDoc(doc(db, 'userData', result.user.email), {
                    uid: result.user.uid,
                    name: result.user.displayName
                })
                setDoc(doc(db, 'users', result.user.uid), {})
                setDoc(doc(db, `users/${result.user.uid}/contactList`, 'list'), {contacts: []})
            }
        }
        initializeUserData()
    })
}

export const logOut = () => {
    signOut(auth)
}

const AuthContext = React.createContext(null)
export const AuthContextProvider = ({ children }) => {
    const [sessionUser, setSessionUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (firebaseUser) => {
            setSessionUser(firebaseUser);
        });
    }, [])

    return <AuthContext.Provider value={sessionUser}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const user = useContext(AuthContext);
    return user;
};
