'use client'

import { useEffect, useState } from "react";
import {db} from "@/app/firebase";
import {addDoc, collection} from "firebase/firestore";

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
  }, [])

  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);

  const [markName, setMarkName] = useState(false);
  const [markReplyTo, setMarkReplyTo] = useState(false);
  const [markMessage, setMarkMessage] = useState(false);

  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");

  const validateName = (ev) => {
    const name = document.getElementById("name").value;
    if (name === "") setMarkName(true);
    else setMarkName(false);
    return name;
  }

  const validateReplyTo = (ev) => {
    const replyTo = document.getElementById("reply-to").value;
    if (replyTo === "") setMarkReplyTo(true);
    else setMarkReplyTo(false);
    return replyTo;
  }

  const validateMessage = (ev) => {
    const message = document.getElementById("message").value;
    if (message === "") setMarkMessage(true);
    else setMarkMessage(false);
    return message;
  }

  const handleSubmit = async () => {
    await validateName();
    await validateReplyTo();
    await validateMessage();

    setIsFormValid(markName === false && markReplyTo === false && markMessage === false);
    console.log(isFormValid)
    console.log(markName, markReplyTo, markMessage)
    if (!isFormValid) return;

    try {
      setIsFormValid(true);
      const obj = {
        name: document.getElementById("name").value,
        replyTo: document.getElementById("reply-to").value,
        message: document.getElementById("message").value,
        timestamp: Date.now()
      }

      const response = await addDoc(collection(db, "messages"), obj);
      setSentSuccessfully(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setIsFormValid(false);
      setErrorMessage("Dogodila se greska pri slanju forme. Molimo Vas da ponovite postupak kasnije.")
    }
  }

  return !mounted ? null : (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className={"left-0 w-2/3 md:w-1/3 mb-4"}>
        <h1 className={"text-2xl"}>Kontakt</h1>
      </div>

      <input
        className={`w-2/3 md:w-1/3 input-no-bg border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4
          focus:bg-white focus:bg-opacity-15 duration-200 ${markName ? 'border-red-400' : 'border-white'}`}
        type={"text"}
        placeholder={"Vaše ime i prezime"}
        id={"name"}
        onChange={(e) => setName(e.target.value) }
      />

      <input
        className={`w-2/3 md:w-1/3 input-no-bg border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4
          focus:bg-white focus:bg-opacity-15 duration-200 ${markReplyTo ? 'border-red-400' : 'border-white'}`}
        type={"text"}
        placeholder={"Vaš e-mail ili telefon"}
        id={"reply-to"}
        onChange={(e) => setReplyTo(e.target.value) }
      />

      <textarea
        className={`w-2/3 md:w-1/3 input-no-bg border-2 border-white border-opacity-50 rounded-lg mb-4 p-4 pt-2
          focus:bg-white focus:bg-opacity-15 duration-200 ${markMessage ? 'border-red-400' : 'border-white'}`}
        placeholder={"Poruka"}
        id={"message"}
        onChange={(e) => setMessage(e.target.value) }
      />

      <div className={`
        w-2/3 md:w-1/3 border-2 border-white border-opacity-50 rounded-lg h-10 mb-4 p-4
        bg-white bg-opacity-0 hover:bg-opacity-15 hover:cursor-pointer duration-200
        flex flex-row items-center justify-center
      `}
           onClick={async () => { await handleSubmit() }}
      >
        <p>Pošaljite poruku</p>
      </div>

      <p className={"italic font-extralight text-sm mb-4"}>Sva polja su obavezna.</p>

      {
        sentSuccessfully
          ? <p className={"italic font-light text-md text-green-400 mb-4"}>Poruka je uspješno poslana.</p>
          : <p className={"italic font-light text-md text-red-400 mb-4"}>{errorMessage}</p>
      }
    </div>
  );
}
