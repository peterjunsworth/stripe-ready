'use client';

import React from 'react';
import CartIcon from '../icons/icon-cart';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/dropdown";

export const AcmeLogo = () => {
    return (
        <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
            <path
                clipRule="evenodd"
                d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    );
};

export default function Header() {
    return (
        <Navbar
            maxWidth="full"
        >
            <NavbarBrand>
                <Link color="foreground" href="/">
                    <AcmeLogo />
                    <p className="font-bold text-inherit">ACME</p>
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
