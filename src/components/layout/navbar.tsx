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
                        <Link href="/login" className="text-gray-700 hover:text-blue-500">
                            Login
                        </Link>
                        <Link href="/signup" className="text-gray-700 hover:text-blue-500">
                            Register
                        </Link>
                        <Button onClick={handleLogout}>log out</Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
