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
    Target,
    Ticket,
    KanbanSquare,
} from "lucide-react"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { usePermissions } from "@/contexts/PermissionContext"

export default function Sidebar() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const { data: session } = useSession()
    const pathname = usePathname()
    const { hasPermission, hasAnyPermission } = usePermissions()
    
    // All navigation items with permission-based filtering
    const allNavItems = [
        { icon: <Activity className="w-5 h-5" />, label: "Your Dashboard", href: "/", adminOnly: false },
        { icon: <Ticket className="w-5 h-5" />, label: "Support Tickets", href: "/tickets", adminOnly: false },
        { icon: <FileText className="w-5 h-5" />, label: "Admin Dashboard", href: "/admin", permission: "dashboard.admin" },
        { icon: <FileText className="w-5 h-5" />, label: "Employees", href: "/admin/employees", permission: "users.view" },
        { icon: <Shield className="w-5 h-5" />, label: "Roles", href: "/admin/roles", permission: "roles.view" },
        { icon: <Key className="w-5 h-5" />, label: "Permissions", href: "/admin/permissions", permission: "permissions.view" },
        { icon: <Server className="w-5 h-5" />, label: "Hosting", href: "/admin/hosting", permission: "hosting.view" },
        { icon: <Users className="w-5 h-5" />, label: "Teams", href: "/teams", permission: "teams.view" },
        { icon: <MessageSquare className="w-5 h-5" />, label: "Chat", href: "/chat", permission: "chat.view" },
        { icon: <KanbanSquare className="w-5 h-5" />, label: "Boards", href: "/kanban", permission: "kanban.view" },
        { icon: <FileText className="w-5 h-5" />, label: "Leaves", href: "/leaves", permission: "leaves.view" },
        { icon: <Target className="w-5 h-5" />, label: "Leads", href: "/leads", permission: "leads.view" },
    ];
    
    // Filter navigation items based on user permissions
    const navItems = allNavItems.filter(item => !item.permission || hasPermission(item.permission));
    
    return (
        <aside
            className={`bg-[#1a1a1a] transition-all duration-300 h-screen ${sidebarCollapsed ? "w-20" : "w-64"} flex flex-col`}
        >
            {/* Logo */}
            <div className="flex items-center p-4 border-b border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                    <Image
                        src="/logo.png"
                        alt="Mize Technologies"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>
                {!sidebarCollapsed && (
                    <div className="ml-3">
                        <span className="font-bold text-md text-white tracking-wide">Mize Technologies</span>
                        <p className="text-xs text-gray-400 mt-0.5">Management System</p>
                    </div>
                )}
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
                                    className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 font-medium gap-3 relative
                                        ${isActive 
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25" 
                                            : "text-gray-300 hover:bg-white/5 hover:text-white hover:shadow-md"
                                        }
                                    `}
                                >
                                    <div className={`flex items-center justify-center w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                                        {item.icon}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <span className={`transition-all duration-200 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80" />
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-white/10 mt-auto">
                {/* User Info */}
                {session && !sidebarCollapsed && (
                    <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                {session.user?.name ? session.user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {session.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2.5 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 group"
                    >
                        <div className="flex items-center justify-center w-5 h-5 group-hover:scale-105 transition-transform">
                            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </div>
                        {!sidebarCollapsed && <span className="ml-2 text-sm font-medium">Collapse</span>}
                    </button>
                    <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full flex items-center justify-center p-2.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-500/20"
                    >
                        <div className="flex items-center justify-center w-5 h-5 group-hover:scale-105 transition-transform">
                            <LogOut className="w-5 h-5" />
                        </div>
                        {!sidebarCollapsed && <span className="ml-2 text-sm font-medium">Logout</span>}
                    </Button>
                </div>
            </div>
        </aside>
    )
}