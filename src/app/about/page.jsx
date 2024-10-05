'use client'

import "@/app/globals.css";
import { useEffect, useState } from "react";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return !mounted ? null : (
    <div className={"p-8 md:p-20 flex flex-col items-start"}>
      <div className={"flex flex-row items-center"}>
        <div>
          <h1 className={"text-3xl md:text-5xl"}>Ko sam ja?</h1>
          <hr className={"my-4"}/>
        </div>
      </div>

      <div className={"md:text-xl text-lg"}>
        <p>Ja sam Zoran Komadina, lorem ipsum dolor sit amet.</p>
      </div>
    </div>
  );
}
