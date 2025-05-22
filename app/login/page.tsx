"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen w-full flex">
      {/* Left Section */}
      <div className="w-1/2 relative flex flex-col justify-between bg-gradient-to-b from-primary to-primary-dark">
        <Image
          src="/authentication-bg-01.png"
          alt="Background"
          fill
          className="object-cover absolute inset-0 z-0"
        />
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12">
          <div className="bg-white/20 filter backdrop-blur-lg rounded-xl p-8 shadow-lg max-w-md w-full flex flex-col items-center">
            
            <h2 className="text-white text-2xl font-bold mb-4 text-center">
              Empowering people<br />through seamless HR management.
            </h2>
            <p className="text-white text-base text-center mb-2">
              Efficiently manage your workforce, streamline operations effortlessly.
            </p>
          </div>
        </div>
        <div className="h-24" />
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col justify-center items-center relative bg-white">
        {/* Logo */}
        
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh]">
          <h1 className="text-2xl font-bold mb-2 mt-16 text-center">Sign In</h1>
          <span className="text-sm text-gray-500 mb-6 text-center block">
            Please enter your details to sign in
          </span>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <Input name="email" type="email" placeholder="Email Address" required />
            <Input name="password" type="password" placeholder="Password" required />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-orange-500" /> Remember Me
              </label>
              <a href="#" className="text-orange-500 hover:underline">Forgot Password?</a>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
        </div>
        <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          Copyright © 2025 - Mize Technologies
        </footer>
      </div>
    </section>
  )
} 