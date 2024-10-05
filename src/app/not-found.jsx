'use client'

import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";


export const NotFound = () => {
  const router = useRouter();

  return (<div className={ "flex flex-col items-center justify-center h-screen" }>
    <div className={ "flex flex-row items-center gap-4 border-red-400 border-opacity-50 rounded-xl p-4 border-2" }>
      <p className={ "text-2xl" }>404</p>
      <div className={ "h-12 w-0.5 bg-white bg-opacity-50" }/>
      <p className={ "text-lg font-light" }>Stranica nije pronađena.</p>
    </div>

    <div className={ `
      rounded-lg bg-opacity-0 bg-white hover:bg-opacity-15 duration-200 p-2 hover:cursor-pointer
      flex flex-row gap-2 items-center scale-125 my-4 mt-8
    ` } onClick={() => router.back()}>
      <FontAwesomeIcon icon={ faArrowLeftLong }/>
      <p>Povratak nazad</p>
    </div>
  </div>)
}

export default NotFound;
