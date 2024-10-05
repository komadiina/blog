'use client'

import {useEffect, useState} from "react";
import {app, auth, db, storage} from "@/app/firebase"
import {doc, getDoc, getFirestore, updateDoc, deleteDoc} from "firebase/firestore";
import {getImageFBS, LIZARD_PLACEHOLDER} from "@/app/posts/page";
import ReactQuill from "react-quill";
import '@/app/styles/quill.bubble.css'
import '@/app/styles/quill.snow.css'
import {useAuthState} from "react-firebase-hooks/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash, faPlus, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {useRouter} from "next/navigation";
import {ref, deleteObject} from "firebase/storage";

const firestore = getFirestore(app)

const getPost = async (id) => {
  const reference = doc(firestore, "posts", id);
  const snapshot = await getDoc(reference)

  if (snapshot.exists()) {
    return ({
      id: snapshot.id,
      title: snapshot.get("title"),
      about: snapshot.get("about"),
      body: snapshot.get("body"),
      author: snapshot.get("author"),
      date: snapshot.get("date"),
      gallery: snapshot.get("gallery") ?? [LIZARD_PLACEHOLDER]
    })
  } else {
    return {error: "Error! No such document exists: " + id}
  }
}

export default function PostPage({ params }) {
  const router = useRouter();
  const [user ] = useAuthState(auth);
  const [notFound, setNotFound] = useState(false);
  let id = params.id;
  let [loaded, setLoaded] = useState(false);
  const [post, setPost] = useState({})
  const [imageURLs, setImageURLs] = useState([])
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const fetchPost = async () => {
        const fetched = await getPost(id)
        setPost(fetched)

        const urls = await Promise.all(
          fetched.gallery.map(async (path) => {
            const result = await getImageFBS(path, false);
            return result;
          })
        )

        setImageURLs(urls)
      }
      fetchPost()
      setLoaded(true)
    } catch (e) {
     setNotFound(true)
    }
    setMounted(true)
  }, [id, loaded]);

  const displayImages = (imageURLs) => {
    return imageURLs.map((url) =>
      <div key={url} className={"hover:cursor-pointer my-4 transition-all duration-200 hover:scale-105"}
           onClick={() => {
             window.location.assign(url)
           }}>
        <img src={url} alt={"galerija"} className={"gallery-member"}/>
      </div>
    )
  }

  let postComponent = () => {
    return (
      <div className={"grid grid-flow-row grid-cols-1 p-8 lg:p-0 lg:pt-8 lg:grid-cols-3 justify-evenly items-center"}>
        <div/>
        <div>
          <h1 className={"text-xl lg:text-3xl lg:text-center"}>{post.title}</h1>
          <p className={"text-sm pt-1.5 lg:text-center italic"}>Objavio: {post.author}, na datum: {post.date}</p>
          <hr className={"bg-white my-2 border-white"}/>

          <ReactQuill theme={"bubble"} value={post.body} readOnly={true}/>

          <hr className={"bg-white my-2 border-white"}/>
          <p className={"text-xl italic"}>Galerija</p>

          {displayImages(imageURLs)}
        </div>
        <div/>
      </div>
    )
  }

  const handleEditPost = async () => {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, {
      title,
      body,
      gallery: imageURLs,
    });
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    const url = await getImageFBS(file, true);
    setImageURLs((prevImageURLs) => [...prevImageURLs, url]);
  };

  const handleRemoveImage = (index) => {
    setImageURLs((prevImageURLs) => prevImageURLs.filter((url, i) => i !== index));
  };

  const handleDeletePost = async () => {
    setOpenConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleConfirmDelete  = async () => {
    const postRef = await doc(db, 'posts', id);
    const images = post.gallery;
    // remove images from storage (/images/{gallery_item}, /images/thumbnails/{gallery_item})
    for (let i = 0; i < images.length; i++) {
      console.log(images[i]);

      const imageRef = ref(storage, `images/${images[i]}`);
      const imageTBRef = ref(storage, `images/thumbnails/${images[i]}`);
      console.log(imageRef.fullPath)

      await deleteObject(imageRef);
      await deleteObject(imageTBRef);
    }


    await deleteDoc(postRef);
    router.push('/posts');
  }

  return !mounted ? null : (
    <>
      { (!notFound && user) && (
        <div className="flex justify-center pt-16 text-3xl gap-8">
          <button className="p-4 m-4 bg-green-500 bg-opacity-25 rounded-md" onClick={() => {
            setOpen(true)
          }}>
            <FontAwesomeIcon icon={faEdit}/>
          </button>
          <button
            className="p-4 m-4 bg-red-500 bg-opacity-25 rounded-md text-white"
            onClick={handleDeletePost}
          >
            <FontAwesomeIcon icon={faTrash}/>
          </button>
          <Dialog
            open={openConfirmDelete}
            onClose={handleCancelDelete}
            PaperProps={{
              style: {
                backgroundColor: '#333',
                color: '#fff',
              },
            }}
          >
            <DialogTitle>Potvrdite brisanje</DialogTitle>
            <DialogContent>
              <p>Da li ste sigurni da želite izbrisati ovu objavu?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleConfirmDelete} variant={"contained"}>Da</Button>
              <Button onClick={handleCancelDelete} variant={"contained"}>Ne</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}

      <Dialog
        open={open}
        onClose={handleCancel}
        PaperProps={{
          style: {
            backgroundColor: '#333',
            color: '#fff',
          },
        }}
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Naziv"
            value={title}
            slotProps={{
              input: {
                style: {
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'white',
                },
              },
              inputLabel: {
                style: {
                  color: '#fff',
                },
              },
            }}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <ReactQuill
            value={post.body}
            onChange={(value) => setBody(value)}
            theme="snow"
          />
          <div className="flex flex-wrap gap-2 vertical-separator my-4">
            {imageURLs.map((url, index) => (
              <div key={index} className="relative bg-black bg-opacity-50">
                <img src={url} alt="Post Image" className="w-32 h-32" />
                <button
                  className="absolute top-0 right-0 p-4 m-4 bg-red-500 text-white rounded-full"
                  onClick={() => handleRemoveImage(index)}
                >
                  <FontAwesomeIcon className={"align-middle "} icon={faTrash} />
                </button>
              </div>
            ))}
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
              id="image-input"
            />
            <label
              htmlFor="image-input"
              className="bg-blue-500 text-white p-2 rounded-sm cursor-pointer"
            >
              <FontAwesomeIcon className={"align-middle w-32 h-32 rounded-sm"} icon={faPlus} />
            </label>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Izađi</Button>
          <Button onClick={handleEditPost}>Potvrdi</Button>
        </DialogActions>
      </Dialog>

      {
        notFound
          ? NotFound(router)
          : loaded
            ? postComponent()
            : <LoadingPlaceholder/>
      }
    </>
  )
}

const NotFound = (router) => {
  return (
    <div className={`
      flex flex-col items-center justify-center h-screen gap-2
    `}>
      <div className={`
        grid grid-flow-col grid-rows-2 p-4 gap-2
        bg-opacity-0 bg-white hover:bg-opacity-15 rounded-lg duration-200 hover:cursor-pointer
        `}
           onClick={() => {router.back()}}
      >
        <p>[<span className={"text-red-400"}>404</span>] Objava nije pronađena.</p>
        <div><FontAwesomeIcon icon={faArrowLeftLong}/> Vratite se nazad.</div>
      </div>
    </div>
  );
}

const LoadingPlaceholder = () => {
  return (
    <div className={"grid grid-flow-row grid-cols-1 p-8 lg:p-0 lg:pt-8 lg:grid-cols-3 justify-evenly items-center"}>
      <div/>
      <div>
        <h1 className={"text-xl lg:text-3xl lg:text-center"}>Učitavanje...</h1>
      </div>
      <div/>
    </div>
  )
}
