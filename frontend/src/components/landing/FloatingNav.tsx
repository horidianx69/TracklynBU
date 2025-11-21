
// import React, { useState } from "react";
// import {
//   motion,
//   AnimatePresence,
//   useScroll,
//   useMotionValueEvent,
// } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { Link } from "react-router-dom"; // <-- fixed import

// export const FloatingNav = ({
//   navItems,
//   className,
// }: {
//   navItems: {
//     name: string;
//     link: string;
//     icon?: JSX.Element;
//   }[];
//   className?: string;
// }) => {
//   const { scrollYProgress } = useScroll();
//   const [visible, setVisible] = useState(false);

//   useMotionValueEvent(scrollYProgress, "change", (current) => {
//     if (typeof current === "number") {
//       let direction = current - scrollYProgress.getPrevious()!;
//       if (scrollYProgress.get() < 0.05) {
//         setVisible(false);
//       } else {
//         if (direction < 0) setVisible(true);
//         else setVisible(false);
//       }
//     }
//   });

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         initial={{ opacity: 1, y: -100 }}
//         animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
//         transition={{ duration: 0.2 }}
//         className={cn(
//           "flex max-w-fit fixed top-10 inset-x-0 mx-auto border rounded-full z-[5000] px-10 py-5 items-center justify-center space-x-4 border-white/[0.2] bg-black-100",
//           className
//         )}
//       >
//         {navItems.map((navItem, idx) => (
//           <Link
//             key={`link=${idx}`}
//             to={navItem.link} // <-- use `to` not `href`
//             className={cn(
//               "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"
//             )}
//           >
//             <span className="block sm:hidden">{navItem.icon}</span>
//             <span className="text-sm !cursor-pointer">{navItem.name}</span>
//           </Link>
//         ))}
//       </motion.div>
//     </AnimatePresence>
//   );
// };
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom"; // Ensure this is from react-router-dom

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          // Increased max-width to fit buttons
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-8 py-4 items-center justify-center space-x-4 border-white/[0.2] bg-black-100",
          className
        )}
      >
        {/* Existing Nav Items */}
        {navItems.map((navItem: any, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="text-sm !cursor-pointer">{navItem.name}</span>
          </a>
        ))}

        {/* --- NEW CODE STARTS HERE --- */}
        
        {/* Vertical Separator Line */}
        <div className="h-4 w-px bg-white/[0.2] mx-2 hidden sm:block" />

        {/* Sign In (Text Link style) */}
        <Link 
            to="/sign-in" 
            className="text-sm font-medium text-neutral-300 hover:text-white hidden sm:block"
        >
            Sign In
        </Link>

        {/* Sign Up (Button style matching theme) */}
        <Link 
            to="/sign-up"
            className="text-sm font-medium relative border border-white/[0.2] text-white px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition duration-200"
        >
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
            Sign Up
        </Link>
        
        {/* --- NEW CODE ENDS HERE --- */}

      </motion.div>
    </AnimatePresence>
  );
};