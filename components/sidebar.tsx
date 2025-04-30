"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "./ui/button"
import { signOut } from "next-auth/react"
import Image from "next/image"

export default function Sidebar() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    return (
        <aside
            className={`bg-[#FF7B3D] transition-all duration-300 h-screen ${sidebarCollapsed ? "w-20" : "w-64"} flex flex-col`}
        >
            {/* Logo */}
            <div className="flex items-center p-4 border-b border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white/20">
                    <Layout className="w-6 h-6 text-white" />
                </div>
                {!sidebarCollapsed && <span className="ml-3 font-semibold text-lg text-white tracking-wide">SmartHR</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                    {[
                        { icon: <Activity className="w-5 h-5" />, label: "Your Dashboard", active: true, href: "/" },
                        { icon: <FileText className="w-5 h-5" />, label: "Admin Dashboard", href: "/admin" },
                        { icon: <FileText className="w-5 h-5" />, label: "Employees", href: "/admin/employees" },
                        { icon: <FileText className="w-5 h-5" />, label: "Leaves", href: "/leaves" },
                    ].map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.href}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-150 font-medium gap-2
                                    ${item.active ? "bg-white/90 text-[#FF7B3D] shadow" : "text-white hover:bg-white/10 hover:text-white"}
                                `}
                            >
                                {item.icon}
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-white/10 mt-auto">
                <div className="space-y-3">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="ml-2">Logout</span>}
                    </Button>
                </div>
            </div>
        </aside>
    )
}