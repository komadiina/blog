'use client'

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAddressCard, faArrowRight, faBolt} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {getPosts} from "@/app/posts/page";
import '@/app/styles/quill.bubble.css'

const postBanner = (post, router) => {
  const desanitizer = new RegExp("<.*?>", "g");
  let body = post.body.replace(desanitizer, "");

  return (
    <div
      key={post.id}
      className={`
        border-2 border-opacity-50 border-white p-4 rounded-lg m-4 min-w-[200px]
        bg-white bg-opacity-0 hover:bg-opacity-15 hover:cursor-pointer duration-200
        w-full h-full
        `}
      onClick={() => {router.push(`/posts/${post.id}`)}}
    >
      <h1 className={"text-lg font-bold"}>{post.title}</h1>
      <p className={"italic text-sm pt-0.5"}>{post.author}</p>
    </div>
  );
}

function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postData = await getPosts();
      setPosts(postData.slice(0, 3));
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className={"mb-2 text-xl"}>Dobrodošli!</h1>
      <hr className={"w-32 mb-2"}/>

      <div>
        <div className={"flex flex-row items-center justify-center gap-2"}>
          <div
            className={`rounded-lg bg-opacity-0 bg-white hover:bg-opacity-15 duration-200 p-2 mt-2 hover:cursor-pointer`}
            onClick={() => {
              router.push('/posts')
            }}
          >
            <p className={"italic"}>Sve objave <FontAwesomeIcon className={"pl-1"} icon={faArrowRight} aria-hidden/></p>
          </div>
        </div>
        <div className={"flex flex-col md:flex-row items-center justify-evenly gap-3 my-4"}>
          {posts.map((post) => postBanner(post, router))}
        </div>
      </div>

      <hr className={"w-32 mb-2"}/>
      <div className={"flex flex-row"}>
        <div className={"flex flex-row items-center justify-center gap-2 m-2"}>
          <div className={`
            p-2 bg-opacity-0 bg-white hover:cursor-pointer hover:bg-opacity-15
            rounded-lg duration-200
          `}
            onClick={() => {router.push('/about')}}
          >
            <p><FontAwesomeIcon icon={faBolt} aria-hidden/> O meni</p>
          </div>
        </div>

        <div className={"flex flex-row items-center justify-center gap-2 m-2"}>
          <div className={`
            p-2 bg-opacity-0 bg-white hover:cursor-pointer hover:bg-opacity-15
            rounded-lg duration-200
          `}
               onClick={() => {router.push('/contact')}}
          >
            <p><FontAwesomeIcon icon={faAddressCard} aria-hidden/> Kontakt</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
