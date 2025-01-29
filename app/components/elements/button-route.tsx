'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';

export default function ButtonRouter({
    path,
    title,
    classes = "",
    isDisabled = false
}: {
    path: string,
    title: string,
    classes?: string
    isDisabled?: boolean
}) {

    const router = useRouter();

    const handleNavigation = () => {
        router.push(path); // Replace with your target route
    };

    return (
        <Button 
            className={classes}
            color="primary"
            isDisabled={isDisabled}
            onClick={handleNavigation}
        >
            {title}
        </Button>
    );
}
