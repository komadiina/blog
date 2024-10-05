'use client'

import { submitPost } from "@/app/dashboard/postHandler";
import { auth, db, storage } from "@/app/firebase";
import NotFound from "@/app/not-found";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@/app/styles/quill.snow.css"
import { useDropzone } from "react-dropzone";


export const Dashboard = () => {
  const ReactQuill = useMemo(() =>
      dynamic(() => import("react-quill"),
        { ssr: false }),
    []);

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [images, setImages] = useState([])
  const [user, setUser] = useState(null)
  const [response, setResponse] = useState({})

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    console.log("rerender!")
  }, [user]);

  const onDrop = useCallback(acceptedFiles => {
    let joined = images.concat(acceptedFiles)
    setImages(joined);
  }, [images])
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (user == null) {
    return (
      <NotFound/>
    )
  }

  const handleSubmit = async () => {
    if (title === '' || body === '') {
      alert('Niste uneli sve podatke')
      return
    }

    const result = await submitPost(title, body, 'Zoran Komadina', images, db, storage);
    setResponse(result);
  }

  return (
    <div className={ "flex flex-col items-center justify-center h-screen gap-2" }>
      <div className={ "flex flex-col items-start gap-2 w-5/6 sm:w-2/3" }>
        <div className={ "flex flex-row items-center justify-between h-max w-full" }>
          <h1 className={ "text-3xl font-light my-4" }>Kreirajte objavu</h1>
          <div className={ `
            rounded-lg bg-opacity-15 bg-green-400 hover:bg-opacity-50 duration-200 p-2 hover:cursor-pointer
            flex flex-row gap-2 items-center justify-center
            border-white border-2 border-opacity-75
          ` }
               onClick={ handleSubmit }
          ><FontAwesomeIcon icon={ faPlus }/> Postavi
          </div>
        </div>
        <input
          className={ `
        w-full input-no-bg border-2 border-white border-opacity-75 p-4 rounded-xl antialiased sm:text-md text-lg
      ` }
          placeholder={ "Naziv objave" }
          value={ title }
          onChange={ (e) => setTitle(e.target.value) }
        />

        <ReactQuill theme={ "snow" } value={ body } readOnly={ false }
                    onChange={ (text) => setBody(text) }
                    className={ "w-full rounded-lg antialiased" }
                    placeholder={ "Sadržaj objave" }
        />

        <div { ...getRootProps() }
             className={ `
                w-full my-16 sm:my-12 rounded-lg border-2 border-white border-opacity-75
                p-4 bg-white bg-opacity-0 hover:bg-opacity-15 hover:cursor-pointer duration-200
                flex flex-col items-center justify-center
             ` }>
          <p className={ "text-lg font-light" }>Dodajte slike</p>
          <input { ...getInputProps() }/>
        </div>

        <div
          className={ "flex flex-row items-center justify-center gap-2 flex-wrap" }
        >
          {
            images.map((image, index) => (

              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={ index }
                className={ `
                w-48 h-48 object-cover hover:cursor-pointer hover:border-2 border-white
              ` }
                src={ URL.createObjectURL(image) }
                onClick={ () => setImages(images.filter((_, i) => i !== index)) }
                alt={ "slika" }/>
            ))
          }
        </div>

        {
          response.success
            ? <p className={ "text-green-400 text-lg font-light my-4" }>Uspješno kreirana objava!</p>
            : <p className={ "text-red-400 text-lg font-light" }>{ response.message }</p>
        }
      </div>
    </div>
  )
}

export default Dashboard;
