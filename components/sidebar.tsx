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

export default function Sidebar() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [theme, setTheme] = useState("light")
    return (
        <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-64"}`}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white">
                        <Layout className="w-6 h-6" />
                    </div>
                    {!sidebarCollapsed && <span className="ml-3 font-semibold text-lg">SmartHR</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1 px-2">
                        {[
                            { icon: <Activity className="w-5 h-5" />, label: "Your Dashboard", active: true, href: "/" },
                            { icon: <FileText className="w-5 h-5" />, label: "Admin Dashboard", href: "/admin" }
                        ].map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 rounded-md ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.icon}
                                    {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Bottom Controls */}
                <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                       
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                        >
                            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        <Button
                            onClick={() => signOut()}
                            variant="outline"
                            className="w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <LogOut className="w-5 h-5" />
                            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    )
}