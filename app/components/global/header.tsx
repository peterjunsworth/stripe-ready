'use client';

import React, { useEffect, useState } from 'react';
import CartIcon from '../icons/icon-cart';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/dropdown";
import { Logo } from "@/app/components/icons/icon-logo";

export default function Header() {
    
    const [businessName, setBusinessName] = useState("");

    useEffect(() => {
        const getAccountInfo = async () => {
            const response = await fetch('/api/stripe/account-management');
            const data = await response.json();
            setBusinessName(data?.account?.settings?.dashboard?.display_name || "ACME");
        }
        getAccountInfo();
    }, []);

    return (
        <Navbar
            maxWidth="full"
        >
            <NavbarBrand>
                <Link color="foreground" href="/">
                    <Image 
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/stripe-ready.png`}
                        className='mr-2'
                        width={40}
                        removeWrapper={true}
                        alt="logo"
                    />
                    <p className="font-bold text-inherit">{businessName}</p>
                </Link>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link color="foreground" href="/products">
                        Shop
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>Admin</Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Manage Options">
                            <DropdownItem>
                                <Link color="foreground" href="/admin/products">
                                    Manage Products
                                </Link>
                            </DropdownItem>
                            <DropdownItem>
                                <Link color="foreground" href="/admin/shipping">
                                    Manage Shipping Rates
                                </Link>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
                <NavbarItem>
                    <Button
                        as={Link}
                        isIconOnly={true}
                        href="/cart"
                        variant="light"
                    >
                        <CartIcon />
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
