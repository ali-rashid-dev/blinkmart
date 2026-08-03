"use client";
import Link from 'next/link';
import { Button } from '../ui/button'
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';


export const Navbar = () => {
    const router = useRouter();
    const handleLogout = async() => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login"); // redirect to login page
                },
            },
        });
    }
    return (
        <div className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold">BlinkMart</h1>
                    </div>
                    <nav className="flex space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-blue-500">
                            Home
                        </Link>
                        <Link href="/products" className="text-gray-700 hover:text-blue-500">
                            Products
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-500">
                            About
                        </Link>
                        <Button onClick={handleLogout}>log out</Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
