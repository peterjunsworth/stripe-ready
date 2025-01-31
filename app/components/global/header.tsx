'use client';

import React, { useEffect, useState } from 'react';
import CartIcon from '../icons/icon-cart';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image, Badge } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/dropdown";
import { Logo } from "@/app/components/icons/icon-logo";
import { PriceParams } from '@/types/interfaces';
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react';

export default function Header() {
    
    const [businessName, setBusinessName] = useState("");
    const [cartCount, setCartCount] = useState(0);

    const { data: session } = useSession();

    useEffect(() => {
        const handleSameTabChange = () => {
            try {
                const cartValues = localStorage.getItem('stripe-ready-cart') ?? '[]';
                const parsedCartValues = JSON.parse(cartValues);
                const totalQuantity = parsedCartValues.length
                    ? parsedCartValues.reduce((sum: number, item: PriceParams) => sum + (item.quantity ?? 0), 0)
                    : 0;
                setCartCount(totalQuantity);
            } catch (error) {
                console.log(error);
            }
        };
        window.addEventListener('cartUpdated', handleSameTabChange);
        handleSameTabChange();
        return () => {
            window.removeEventListener('cartUpdated', handleSameTabChange);
        };
    }, []);

    useEffect(() => {
        const getAccountInfo = async () => {
            const response = await fetch('/api/stripe/account-management');
            const data = await response.json();
            setBusinessName(data?.account?.settings?.dashboard?.display_name || "ACME");
        }
        getAccountInfo();
    }, []);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/sign-in' }); // You can customize the redirect URL
    };

    return (
        <Navbar
            maxWidth="full"
            className="shadow-sm"
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
                {session && (
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
                                <DropdownItem className='p-0 mt-2'>
                                    <Button className="w-full" color="danger" onClick={handleSignOut}>Sign Out</Button>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                )}
                <NavbarItem>
                    <Badge color="primary" content={cartCount}>
                        <Button
                            as={Link}
                            isIconOnly={true}
                            href="/cart"
                            variant="light"
                        >
                            <CartIcon />
                        </Button>
                    </Badge>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
