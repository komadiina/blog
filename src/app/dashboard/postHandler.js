'use client'

import { addDoc, collection, runTransaction } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { compressAccurately } from "image-conversion";

export const submitPost = async (title, body, author, images, db, storage) => {
  const date = new Date();
  try {
    await runTransaction(db,  async (t) => {
      await addDoc(collection(db, 'posts'), {
        "title": title,
        "body": body,
        "author": author,
        "date": `${ date.getDate() }/${ date.getMonth() + 1 }/${ date.getFullYear() }`,
        "gallery": images.map((image) => image.path)
      })
    })

    images.forEach((image) => {
      const originalPath = `images/${image.path}`;
      const thumbnailPath = `images/thumbnails/${image.path}`;

      compressAccurately(image, 50).then(
        (compressedThumbnail) => {
          const thumbnailRef = ref(storage, thumbnailPath);
          uploadBytes(thumbnailRef, compressedThumbnail, {contentType: compressedThumbnail.type});
        }
      )

      const originalRef = ref(storage, originalPath);
      uploadBytes(originalRef, image, {contentType: image.type});
    })
  } catch (e) {
    console.error(e.message)
    return ({
      success: false,
      message: e.message
    })
  }

  return ({
    success: true,
    message: "Objava uspješno kreirana!"
  })
}
