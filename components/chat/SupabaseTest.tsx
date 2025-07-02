"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setLoading(true)
    setTestResult('')

    try {
      // Test 1: Check if supabase client is configured
      if (!supabase) {
        setTestResult('❌ Supabase client not configured')
        return
      }

      // Test 2: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

      if (!url || !key) {
        setTestResult('❌ Supabase environment variables missing\nRequired: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')
        return
      }

      setTestResult(`✅ Environment variables configured\nURL: ${url}\nService Key: ${key.substring(0, 20)}...`)

      // Test 3: Try to query a non-existent table to test connection
      const { error } = await supabase
        .from('chat_rooms')
        .select('*')
        .limit(1)

      if (error) {
        if (error.message.includes('relation "chat_rooms" does not exist')) {
          setTestResult(prev => prev + '\n\n❌ Database tables not created yet\nPlease run the SQL schema in Supabase')
        } else if (error.message.includes('JWT') || error.message.includes('auth')) {
          setTestResult(prev => prev + '\n\n❌ Authentication issue\nMake sure you are using the SERVICE_ROLE_KEY, not the anon key')
        } else {
          setTestResult(prev => prev + `\n\n❌ Database error: ${error.message}`)
        }
      } else {
        setTestResult(prev => prev + '\n\n✅ Database connection successful!')
        
        // Test real-time functionality
        setTestResult(prev => prev + '\n\n🔄 Testing real-time functionality...')
        
        const channel = supabase
          .channel('test-channel')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'chat_messages' 
            }, 
            (payload) => {
              console.log('Real-time test received:', payload)
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setTestResult(prev => prev + '\n✅ Real-time subscriptions working!')
            } else if (status === 'CHANNEL_ERROR') {
              setTestResult(prev => prev + '\n❌ Real-time subscription failed')
            }
          })
          
        // Clean up after 3 seconds
        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 3000)
      }

    } catch (error: any) {
      setTestResult(`❌ Connection failed: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4">Supabase Connection Test</h3>
      
      <Button 
        onClick={testSupabaseConnection}
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>

      {testResult && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </Card>
  )
} 