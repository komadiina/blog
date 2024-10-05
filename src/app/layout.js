import "./globals.css";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

import {Montserrat} from 'next/font/google';

const metadata = {
  title: "Blog | Zoran Komadina",
  description: "Razne prilike i zanimljivosti",
};

const montserrat = Montserrat({subsets: ['latin']})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Blog | Zoran Komadina</title>
      </head>

      <body
        className={`antialiased`}
        style={{fontFamily: `${montserrat.style.fontFamily}`}}
      >
        <Sidebar/>
        {children}
        {/*<Footer/>*/}
      </body>
    </html>
  );
}
