'use client';

import React, { useEffect, useState } from 'react';
import CartIcon from '../icons/icon-cart';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image, Badge, Input } from "@nextui-org/react";
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
import SearchIcon from '@/app/components/icons/icon-search';

export default function Header() {
    
    const [businessName, setBusinessName] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

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

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(async () => {
            const event = new CustomEvent('searchUpdated', {
                detail: value, // Pass the query in the event detail
            });
            window.dispatchEvent(event);
        }, 1000);
        setTypingTimeout(timeout);
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
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[10rem] h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper:
                                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                        }}
                        placeholder="Type to search..."
                        size="sm"
                        startContent={<SearchIcon size={18} />}
                        type="search"
                        onChange={handleSearch}
                    />
                </NavbarItem>
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
