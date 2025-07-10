"use client";

import React from 'react';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

function Header() {
  const path = usePathname(); // Initialize the path variable here
  
  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-small'>
        <Image src={'/logo.svg'}  width = {70} height={70} alt='logo'/>
        <ul className='hidden md:flex gap-8'> 
            <li className={`hover:text-primary hover:font-bold transition-all 
            cursor-pointer
            ${path==='/dashboard' && 'text-primary font-bold'}
            `}
            >Dashboard</li>
            <li className={`hover:text-primary hover:font-bold transition-all 
            cursor-pointer
            ${path==='/Question' && 'text-primary font-bold'}
            `}
            >Question</li>
            <li className={`hover:text-primary hover:font-bold transition-all 
            cursor-pointer
            ${path==='/Upgrade' && 'text-primary font-bold'}
            `}
            >Upgrade</li>
            <li className={`hover:text-primary hover:font-bold transition-all 
            cursor-pointer
            ${path==='/How it works' && 'text-primary font-bold'}
            `}
            >How it works</li>
        </ul>
        <UserButton/>
    </div>
  )
}

export default Header