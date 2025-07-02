import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // No auth check needed when using service role key

    const { data: readStatus, error } = await supabase
      .from('message_read_status')
      .select('*')
      .eq('message_id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json(readStatus || [])
  } catch (error) {
    console.error('Error fetching read status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 