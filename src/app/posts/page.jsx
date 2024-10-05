'use client'

import {Card, CardActionArea, CardContent, ThemeProvider, Typography} from "@mui/material";
import theme from "@/app/theme";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import app from "@/app/firebase";
import {collection, getDocs, getFirestore, query} from "firebase/firestore";
import { useEffect, useState } from "react";

const storage = getStorage(app)
const firestore = getFirestore(app)

export const LIZARD_PLACEHOLDER = "https://sdzwildlifeexplorers.org/sites/default/files/2021-07/sdzkids_animalprofilepage_lizards_hero.png"

export const getImageFBS = async (path, useThumbnail = true) => {
  if (path === undefined) {
    return LIZARD_PLACEHOLDER;
  }
  const bucketURL = useThumbnail
    ? `images/thumbnails/${path}`
    : `images/${path}`
  const imageRef = ref(storage, bucketURL);
  try {
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error fetching image:", error);
    return LIZARD_PLACEHOLDER;
  }
}

export const getPosts = async () => {
  const q = query(collection(firestore, "posts"))
  const snapshot = await getDocs(q)
  // return ([{
  //   id: "1",
  //   title: "title",
  //   about: "about",
  //   body: "body",
  //   author: "author",
  //   date: "date",
  //   gallery: ["1"]
  // }]);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.get("title"),
    about: doc.get("about"),
    body: doc.get("body"),
    author: doc.get("author"),
    date: doc.get("date"),
    gallery: doc.get("gallery") ?? [LIZARD_PLACEHOLDER]
  }));
}

export default function Page() {
  const [posts, setPosts] = useState([])
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const postData = await getPosts();
      setPosts(postData)
    };

    fetchPosts();
    setMounted(true)
    console.log("rerender!")
  }, []);


  return !mounted ? null : (
    <ThemeProvider theme={theme}>
      <div className={"p-8 md:p-20 flex flex-col items-start"}>
        <div className={"flex flex-row items-center"}>
          <div>
            <h1 className={"text-3xl md:text-5xl"}>Najnovije objave</h1>
            <hr className={"my-4"}/>
          </div>
        </div>

        <div className={"grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"}>
          {
            posts.map((post) => <PostCard key={post.id} post={post}/>)
          }
        </div>
      </div>
    </ThemeProvider>
  );
}

function PostCard({post}) {
  const [imageUrl, setImageUrl] = useState(LIZARD_PLACEHOLDER);

  useEffect(() => {
    const fetchImage = async () => {
      const url = await getImageFBS(post.gallery[0]);
      setImageUrl(url);
    };

    fetchImage();
  }, [post.gallery]);

  return (
    <div className={"h-full py-4 hover:scale-105 transition-all duration-300"}
         onClick={() => window.location.assign(`/posts/${post.id}`)}>
      <Card className={"rounded-lg w-full h-full"} raised={true} style={{backgroundColor: "#1a1a1a"}} color={"theme"}>
        <CardActionArea className={"h-full"}>
          <img src={imageUrl} alt={"slika objave"} className={"cropped-post-header"} width={300} height={169}/>
          <CardContent className={"h-full"}>
            <Typography gutterBottom variant={"h5"} component={"div"} className={"font-bold"} sx={{color: 'white'}}>
              {post.title}
            </Typography>
            <Typography gutterBottom variant={"p"} component={"div"} className={"italic"} sx={{color: 'white'}}>
              {post.title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}
