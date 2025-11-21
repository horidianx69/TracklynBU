// import React from "react";
// import type { Route } from "../../+types/root";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "TaskHub" },
//     { name: "description", content: "Welcome to TaskHub!" },
//   ];
// }

// const Homepage = () => {
//   return (
//     <div className="w-full h-screen flex items-center justify-center gap-4">
//       <Link to="/sign-in">
//         <Button className="bg-blue-500 text-white">Login</Button>
//       </Link>
//       <Link to="/sign-up">
//         <Button variant="outline" className="bg-blue-500 text-white">
//           Sign Up
//         </Button>
//       </Link>
//     </div>
//   );
// };

// export default Homepage;
import Approach from "@/components/landing/Approach";
import Clients from "@/components/landing/Clients";
import Experience from "@/components/landing/Experience";
import Footer from "@/components/landing/Footer";
import Grid from "@/components/landing/Grid";
import Hero from "@/components/landing/Hero";
import RecentProjects from "@/components/landing/RecentProjects";
import { FloatingNav } from "@/components/landing/FloatingNav";


const navItems = [
  { name: "About", link: "#about" },
  { name: "Projects", link: "#projects" },
  { name: "Testimonials", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
];
export default function Home() {
  return (
    <main  className="relative bg-black-100 flex justify-center
     items-center flex-col mx-auto 
     overflow-clip">
      <div className="max-w-7xl w-full">
          <FloatingNav navItems={navItems}/>
        <Hero />
        <Grid />
        <RecentProjects />
        <Clients />
        <Experience />
        <Approach />
        <Footer/>
      </div>
    </main>
  );
}