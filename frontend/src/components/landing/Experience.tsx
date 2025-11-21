
import React from 'react'
import { Button } from './MovingBorders'

const workExperience = [
  {
    id: 1,
    title: "Smart Project Dashboard",
    desc: "Tracklyn gives teachers a unified dashboard showing class progress, student rankings, pending tasks, and top-performing projects — all updated in real time.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Real-Time Project Tracking",
    desc: "Teachers can monitor each student's project journey live — submissions, milestones, delays, and improvements — without manually checking in.",
    className: "md:col-span-2",
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "Teacher Collaboration Tools",
    desc: "Tracklyn lets teachers step into a student’s project directly: add notes, correct issues, attach resources, or guide improvements right from the app.",
    className: "md:col-span-2",
    thumbnail: "/exp3.svg",
  },
  {
    id: 4,
    title: "Built-In Chat & Feedback System",
    desc: "With real-time chat and threaded feedback, teachers can communicate instantly, resolve doubts, and keep project development transparent and smooth.",
    className: "md:col-span-2",
    thumbnail: "/exp4.svg",
  },
];

const Experience = () => {
  return (
    <div className='py-20' id="testimonials">
            <h1 className='heading'>
                Tracklyn
                <span className='text-purple'> Benefits and Features
                    </span>
            </h1>
        <div className='w-full mt-12 grid lg:grid-cols-4
        grid-cols-1 gap-10'>
            {workExperience.map((card)=>(
                <Button 
                    key={card.id}
                    duration={Math.floor(Math.random() *10000)+10000}
                    borderRadius='1.75rem'
                    className='flex-1 text-white border-neutral-200
                    dark:border-slate-800'
                >
                    <div className='flex lg:flex-row flex-col
                    lg:items-center p-3 py-6 md:p-5 lg:p-10
                    gap-2'>
                        <img src={card.thumbnail} alt={card.thumbnail}
                        className='lg:w-32 md:w-20 w-16' />
                        <div className='lg:ms-5'>
                            <h1 className='text-start text-xl md:text-2xl
                            font-bold'>
                                {card.title}
                            </h1>
                            <p className='text-start text-white-100 mt-3
                            font-semibold'>
                                {card.desc}
                            </p>
                        </div>
                    </div>

                </Button>
            ))}
        </div>
    </div>
  )
}

export default Experience
