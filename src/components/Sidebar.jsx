'use client'

import "@/app/globals.css";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowLeft, faArrowRight, faBars} from '@fortawesome/free-solid-svg-icons';

import { auth } from "@/app/firebase";
import { signOut } from "firebase/auth";

export default function Sidebar() {
  const [hidden, setHidden] = useState(true);
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    })

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <>
      {
        hidden
          ? <div className={""}>
            <FontAwesomeIcon icon={faBars} aria-hidden className={`antialiased z-50 text-3xl align-middle fixed bottom-0 p-4 m-4 ease-in-out 
                transition-opacity duration-300 hover:cursor-pointer
                ${hidden ? "opacity-100" : "opacity-0"}`}
                             onClick={() => {
                               setHidden(false);
                             }}/>
          </div>
          : null
      }

      {
        !hidden
          ? <div
            className={"fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ease-in-out"}
            onClick={() => setHidden(true)}
          />
          : null
      }

      <div className={`w-2/3 lg:w-1/6 bg-white p-4 md:p-8 h-screen fixed dark z-30 transform transition-all duration-300 ease-in-out
        ${hidden ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
        <div className={"flex flex-col items-start justify-normal text-xl"}>
          <h1 className={"text-3xl lg:text-2xl text-center py-2 mb-4 pl-2"}>Zoran Komadina, {"\"M. Štecla\""}</h1>
          <button
            className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
            onClick={() => router.push("/")}>Početna
          </button>
          <button
            className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
            onClick={() => router.push("/posts")}>Objave
          </button>
          <button
            className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
            onClick={() => router.push("/about")}>O meni
          </button>
          <button
            className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
            onClick={() => router.push("/contact")}>Kontakt
          </button>
          {user ? (<>
            <button className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
              onClick={() => router.push("/dashboard")}
            >
              Panel
            </button>
            <button
              className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
              onClick={handleLogout}>Odjava
            </button>
            </>
          ) : (
            <button
              className={"my-2 pl-2 w-full h-12 rounded-lg inline align-middle hover:bg-black hover:bg-opacity-10 transition-all duration-300"}
              onClick={() => router.push("/dashboard")}>Prijava
            </button>
          )}
        </div>

        <div className={"absolute bottom-8 w-full left-0 h-8 hover:cursor-pointer pb-4"}
             onClick={() => {
               setHidden(true);
             }}
        >
          {/*<div className={"flex flex-row items-center justify-center text-3xl mb-8 bottom-4"}>*/}
          {/*  <FontAwesomeIcon icon={faArrowLeft} aria-hidden*/}
          {/*                   className={"inline align-middle fa-solid fa-arrow-left bg-opacity-80 rounded-lg" +*/}
          {/*                     " p-2 mb-4 text-5xl text-white bg-black font-light"}/>*/}
          {/*</div>*/}
        </div>
      </div>
    </>
  )
}
