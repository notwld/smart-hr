"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
    Activity,
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    FileText,
    Home,
    Layout,
    Lock,
    Mail,
    Menu,
    MessageSquare,
    Moon,
    MoreVertical,
    Phone,
    Settings,
    Sun,
    Users,
    X,
    ChevronUp,
    LogOut,
    UserPlus,
    Shield,
    Key,
    Server,
} from "lucide-react"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { usePermissions } from "@/contexts/PermissionContext"

export default function Sidebar() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const { data: session } = useSession()
    const pathname = usePathname()
    
    // All navigation items - permissions checks removed
    const navItems = [
        { icon: <Activity className="w-5 h-5" />, label: "Your Dashboard", href: "/" },
        { icon: <FileText className="w-5 h-5" />, label: "Admin Dashboard", href: "/admin" },
        { icon: <FileText className="w-5 h-5" />, label: "Employees", href: "/admin/employees" },
        { icon: <Shield className="w-5 h-5" />, label: "Roles", href: "/admin/roles" },
        { icon: <Key className="w-5 h-5" />, label: "Permissions", href: "/admin/permissions" },
        { icon: <Server className="w-5 h-5" />, label: "Hosting", href: "/admin/hosting" },
        { icon: <Users className="w-5 h-5" />, label: "Teams", href: "/teams" },
        { icon: <MessageSquare className="w-5 h-5" />, label: "Chat", href: "/chat" },
        { icon: <FileText className="w-5 h-5" />, label: "Leaves", href: "/leaves" },
    ];
    
    return (
        <aside
            className={`bg-[#1a1a1a] transition-all duration-300 h-screen ${sidebarCollapsed ? "w-20" : "w-64"} flex flex-col`}
        >
            {/* Logo */}
            <div className="flex items-center p-4 border-b border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/20">
                    <Layout className="w-6 h-6 text-primary" />
                </div>
                {!sidebarCollapsed && <span className="ml-3 font-semibold text-lg text-white tracking-wide">Mize Technologies</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                    {navItems.map((item, index) => {
                        // Simplified logic: exact match first, then parent route logic
                        let isActive = false;
                        
                        if (item.href === '/') {
                            // Root path - only active when exactly on root
                            isActive = pathname === '/';
                        } else {
                            // Check for exact match first
                            if (pathname === item.href) {
                                isActive = true;
                            } else {
                                // For parent routes, only highlight if we're on a child route that doesn't have its own nav item
                                const pathSegments = pathname.split('/').filter(Boolean);
                                const hrefSegments = item.href.split('/').filter(Boolean);
                                
                                // Only apply parent route logic for single-segment parent routes
                                if (hrefSegments.length === 1 && pathSegments.length > 1) {
                                    // Check if current path matches any other nav item exactly
                                    const hasExactMatch = navItems.some(nav => 
                                        nav.href !== item.href && pathname === nav.href
                                    );
                                    
                                    // Only highlight parent if there's no exact match for current path
                                    isActive = !hasExactMatch && pathname.startsWith(item.href + '/');
                                }
                            }
                        }
                        
                        return (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-150 font-medium gap-2
                                        ${isActive 
                                            ? "bg-primary text-white shadow" 
                                            : "text-gray-300 hover:bg-primary/10 hover:text-white"
                                        }
                                    `}
                                >
                                    {item.icon}
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-white/10 mt-auto">
                <div className="space-y-3">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 text-gray-300 hover:bg-primary/10 hover:text-white rounded-lg transition-all"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full flex items-center justify-center p-2 text-gray-300 hover:bg-primary/10 hover:text-white rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="ml-2">Logout</span>}
                    </Button>
                </div>
            </div>
        </aside>
    )
}