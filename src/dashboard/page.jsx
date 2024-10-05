'use client'

import "@/app/globals.css"
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import { addDoc, collection, runTransaction } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import {compressAccurately} from "image-conversion";
import { useCallback, useEffect, useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged } from 'firebase/auth'

import { auth, db, storage } from "@/app/firebase";
import { useDropzone } from "react-dropzone";
import ReactQuill from "react-quill";
import '@/app/styles/quill.snow.css'

export default function Page() {
  const [authorized, setAuthorized] = useState(false);
  const [status, setStatus] = useState('');
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [postBody, setPostBody] = useState('')
  const pictures = []
  const [uploadedPictures, setUploadedPictures] = useState(pictures)
  const [postUploadStatus, setPostUploadStatus] = useState('')
  const handlePictureRemove = async (idx) => {
    setUploadedPictures((prevPictures) => {
      const newPictures = [...prevPictures];
      newPictures.splice(idx, 1);
      return newPictures;
    });
  };

  const handleAddPost = async () => {
    const date = new Date();
    try {
      await runTransaction(db, async (transaction) => {
        await addDoc(collection(db, 'posts'), {
          "title": title,
          "about": postBody.toString().substring(0, 50) + "...",
          "body": postBody,
          "author": "Zoran Komadina",
          "date": `${date.getDay().toString().padStart(2, '0')}/${date.getMonth().toString().padStart(2, '0')}/${date.getFullYear()}`,
          "gallery": uploadedPictures.map((picture) => picture.path)
        });
      });

      uploadedPictures.forEach((picture) => {
        const originalPath = `images/${picture.path}`;
        const thumbnailPath = `images/thumbnails/${picture.path}`;

        compressAccurately(picture, 50).then(
          (compressedThumbnail) => {
            const thumbnailRef = ref(storage, thumbnailPath);
            uploadBytes(thumbnailRef, compressedThumbnail, {contentType: compressedThumbnail.type});
          }
        )

        const originalRef = ref(storage, originalPath);
        uploadBytes(originalRef, picture, {contentType: picture.type});
      })

      setPostUploadStatus('Objava uspješno kreirana!')
    } catch (e) {
      setPostUploadStatus('Nije moguće kreirati objavu.')
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles)

    let joined = uploadedPictures.concat(acceptedFiles)
    setUploadedPictures(joined);
  }, [uploadedPictures])

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });

    setMounted(true);
  }, []);

  async function tryAuthorize(username, password) {
    let status = true;

    await signInWithEmailAndPassword(getAuth(), username, password).catch(function (err) {
      setStatus(err.message);
      status = false;
    })

    return status;
  }

  const handleLogin = async () => {
    const authorized = await tryAuthorize(username, password);
    setAuthorized(authorized);
    if (!authorized) {
      setStatus("Nije moguća prijava na sistem - neispravni kredencijali.")
    }
  }

  return !mounted ? null : (
    <div>
      {
        authorized
          ? <div className={ "p-4 lg:p-8 border-2 border-white rounded-2xl m-4 lg:m-20 bg-opacity-5 bg-gray-400  " }>
            <div className={ "flex flex-col" }>
              {/* Add post panel */ }
              <h1 className={ "font-mono text-2xl mb-4" }>Kreiraj novu objavu</h1>
              <input
                id={ "post-title" }
                className={ "text-xl p-4 input-no-bg font-bold text-white mb-4 border-2 border-white" }
                placeholder={ "Naslov" }
                type={ "text" }
                onChange={ (e) => setTitle(e.target.value) }
              />

              <div className={ "text-white" }>
                <ReactQuill theme={ "snow" } value={ postBody } onChange={ (text) => {
                  setPostBody(text);
                  console.log(text)
                } }/>
              </div>

              <h1 className={ "pt-4 italic text-lg text-gray-400" }>Dodaj slike</h1>

              <div className={ "block w-full" }>
                <div className={ "flex flex-row items-start justify-start" }>
                  {
                    uploadedPictures.map((picture, i) => (
                      <div
                        key={ i }
                        className={ "w-20 h-20 border-2 rounded-xl my-4 mr-4 flex flex-row items-center justify-center " +
                          "hover:cursor-pointer hover:bg-opacity-15 hover:bg-red-400 transition-all duration-200" }
                        onClick={ async () => {
                          await handlePictureRemove(i);
                        } }
                      >
                        <i className="inline align-middle text-xl">{ ~~(picture.size / 1024) } KB</i>
                      </div>
                    ))
                  }
                  <div { ...getRootProps() }>
                    <input { ...getInputProps() }/>
                    <div
                      className={ "w-20 h-20 border-2 rounded-xl my-4 mr-4 flex flex-row items-center justify-center " +
                        "hover:bg-opacity-10 bg-white bg-opacity-0 hover:cursor-pointer transition-all duration-200 hover:scale-105" }>
                      {/*<i className="fa-solid fa-plus align-middle text-3xl"/>*/ }
                      <FontAwesomeIcon icon={ faPlus } className="align-middle text-3xl"/>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={ handleAddPost }
                variant={ "outlined" } color={ "theme" } className={ "border-2 border-white my-2 h-12" }>Postavi</Button>

              <div className={ "flex flex-row items-center justify-center pt-4" }>
                {
                  postUploadStatus !== ''
                    ? <p className={ "text-center text-lg" }>{ postUploadStatus }</p>
                    : null
                }
              </div>
            </div>
          </div>
          : <div className={ "flex flex-col items-center justify-center h-screen" }>
            <input
              className={ "w-2/3 md:w-1/3 input-no-bg border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4 focus:bg-white focus:bg-opacity-15 duration-200" }
              id={ "email" }
              type={ "text" }
              placeholder={ "E-mail" }
              onChange={ (e) => setUsername(e.target.value) }
            />

            <input
              className={ "w-2/3 md:w-1/3 input-no-bg border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4 focus:bg-white focus:bg-opacity-15 duration-200" }
              id={ "password" }
              type={ "password" }
              placeholder={ "Lozinka" }
              autoFocus={ true }
              onChange={ (e) => setPassword(e.target.value) }
            />

            <div className={ `
                w-2/3 md:w-1/3 border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4
                bg-white bg-opacity-0 hover:bg-opacity-15 hover:cursor-pointer duration-200
                flex flex-row items-center justify-center
              ` }
                 onClick={ handleLogin }>
              <p>Prijava</p>
            </div>

            { status && <p className={ "text-red-500" }>{ status }</p> }
          </div>
      }
    </div>
  );
}
