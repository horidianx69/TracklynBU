
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