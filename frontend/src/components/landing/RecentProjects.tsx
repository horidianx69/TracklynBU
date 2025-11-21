import React from 'react'
import { PinContainer } from './3d-pin'
import { FaLocationArrow } from 'react-icons/fa'
const projects = [
  {
    id: 1,
    title: "3D Solar System Planets to Explore",
    des: "Explore the wonders of our solar system with this captivating 3D simulation of the planets using Three.js.",
    img: "/p1.svg",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/three.svg", "/fm.svg"],
    link: "/ui.earth.com",
  },
  {
    id: 2,
    title: "Yoom - Video Conferencing App",
    des: "Simplify your video conferencing experience with Yoom. Seamlessly connect with colleagues and friends.",
    img: "/p2.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/stream.svg", "/c.svg"],
    link: "/ui.yoom.com",
  },
  {
    id: 3,
    title: "AI Image SaaS - Canva Application",
    des: "A REAL Software-as-a-Service app with AI features and a payments and credits system using the latest tech stack.",
    img: "/p3.svg",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/three.svg", "/c.svg"],
    link: "/ui.aiimg.com",
  },
  {
    id: 4,
    title: "Animated Apple Iphone 3D Website",
    des: "Recreated the Apple iPhone 15 Pro website, combining GSAP animations and Three.js 3D effects..",
    img: "/p4.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/three.svg", "/gsap.svg"],
    link: "/ui.apple.com",
  },
];
const RecentProjects = () => {
  return (
    <div className='py-20' id="projects">
      <h1 className='heading'>
        A small selection of {' '}
        <span className='text-purple'> recent projects</span>
      </h1>
      <div className='flex flex-wrap items-center justify-center
      p-4 gap-x-24 gap-y-24 mt-10'>

          {projects.map(({id, title, des,img,iconLists,link})=>(

            <div key={id} className=' sm:h-[41rem] h-[32rem] lg:min-h-[32.5rem]  flex items-center 
            justify-center sm:w-[570px] w-[80vw]'>
              <PinContainer title={link} href={link} >
                <div className='relative flex items-center
                justify-center sm:w-[570px] w-[80vw] overflow-hidden sm:h-[40vh]
                h-[30vh] mb-10'>
                  <div className='relative w-full h-full overflow-hidden lg:rounded-3xl bg-[#13162d] '>
                    <img src="/bg.png" alt="bg-img" />
                  </div>
                  <img 
                  src={img} 
                  alt={title}
                  className='z-10 absolute bottom-0'
                  />
                </div>
                <h1 className='font-bold lg:text-2xl md:text-xl
                 text-base line-clamp-1'>
                  {title}
                </h1>

                <p className='lg:text-xl lg:font-normal 
                font-light text-sm line-clamp-2'>
                  {des}
                </p>

                <div className='flex items-center justify-between
                mt-7 mb-3'>
                  <div className='flex items-center'>
                    {iconLists.map((icon,index)=>(
                      <div key={icon} className='border 
                      border-white/[0.2] rounded-full bg-black
                      lg:w-10 lg:h-10 w-8 h-8
                      flex justify-center items-center'
                      style={{
                        transform:`translateX(-${5 * 
                          index * 2}px)`
                      }}>
                        <img src={icon} alt={icon}
                        className='p-2'/>
                      </div>
                    ))}
                  </div>

                    <div className='flex justify-center
                    items-center'>
                      <p className='flex lg:text-xl
                      md:text-xs text-sm text-purple'>Check Live Site</p>
                      <FaLocationArrow className='ms-3'
                      color='#CBACF9' />
                    </div>

                </div>

              </PinContainer>
            </div>
          ))}
      </div>
    </div>
  )
}

export default RecentProjects
