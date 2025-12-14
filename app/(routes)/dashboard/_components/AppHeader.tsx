import React from "react";
import Image from "next/image";
import { User } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

const menuOptions = [
    {
        id: 1,
        name: 'Home',
        path: '/home'
    },
    {
        id: 2,
        name: 'History',
        path: '/history'
    },
    {
        id: 3,
        name: 'Pricing',
        path: '/pricing'
    },
    {
        id: 4,
        name: 'Profile',
        path: '/profile'
    },
];
function AppHeader() {
  const menuOptions = [
    { name: 'Home' },
    { name: 'History' },
    { name: 'Pricing' },
    { name: 'Profile' },
  ];

  return ( 
    <div className='flex items-center justify-between p-4 shadow px-10 md:px-20 px-40'>
        <Image src={"/logo.svg"} alt="logo" width={60} height={30} />
        
        {/* FIX: Removed 'hidden' and 'md:' to force horizontal layout always */}
        <div className='flex gap-12 items-center'>
            {menuOptions.map((option, index) => (
                <div key={index}>
                    <h2 className='cursor-pointer hover:text-green-500 transition-all'>
                        {option.name}
                    </h2>
                </div>
            ))}
        </div>
        
        <UserButton />  
    </div>
  );
}

export default AppHeader