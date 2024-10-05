'use client'

import { auth } from "@/app/firebase"
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('')

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    })
  }, []);

  if (user) {
    return <div className={ "flex flex-col items-center justify-center h-screen gap-2" }>
      <h1 className={ '' }>Već ste prijavljeni ({ user.email }).</h1>
      <div className={ `
              rounded-lg bg-opacity-0 bg-white hover:bg-opacity-15 duration-200 p-2 mt-2 hover:cursor-pointer
            ` }
           onClick={ () => {
             router.push('/home')
           } }
      >
        <p>
          <FontAwesomeIcon icon={ faHome }/> Nazad na početnu stranicu
        </p>
      </div>
    </div>
  } else {
    return (
      <div>
        <div className={ "flex flex-col items-center justify-center h-screen gap-2" }>
          <div className={ "flex flex-row items-start justify-start" }>
            <h1 className={ 'text-2xl my-2' }>Prijava</h1>
          </div>
          <input
            type="text"
            placeholder="Korisnicko ime"
            className={ "w-2/3 md:w-1/3 p-2 border-2 border-opacity-50 rounded-lg input-no-bg focus:bg-white focus:bg-opacity-15 duration-200" }
            onChange={ (e) => setUsername(e.target.value) }
          />
          <input
            type="password"
            placeholder="Lozinka"
            className={ "w-2/3 md:w-1/3 p-2 border-2 border-opacity-50 rounded-lg input-no-bg focus:bg-white focus:bg-opacity-15 duration-200 autofill:bg-opacity-25" }
            onChange={ (e) => setPassword(e.target.value) }
          />
          <div
            className={ `
              rounded-lg bg-opacity-0 bg-white hover:bg-opacity-15 duration-200 p-2 mt-2 hover:cursor-pointer
              border-white border-opacity-50 border-2
            ` }
            onClick={ async () => {
              setError('')

              await signInWithEmailAndPassword(auth, username, password).then(() => {
                router.back()
              }).catch((e) => {
                setError(e.message)
              })
            } }
          >
            <p>
              {/*<FontAwesomeIcon icon={ faHome }/> */ }
              Prijavite se
            </p>

          </div>

          {
            (error !== '') && <p className={ 'text-red-500 my-2' }>{ error }</p>
          }
        </div>
      </div>
    )
  }
}
