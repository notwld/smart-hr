import { supabase } from './supabase'

export async function createTeamChatRoom(teamId: string, teamName: string, memberIds: string[]) {
  try {
    // Create team chat room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        name: `${teamName} Team Chat`,
        description: `Team chat for ${teamName}`,
        type: 'team',
        team_id: teamId
      })
      .select()
      .single()

    if (roomError) {
      console.error('Error creating team chat room:', roomError)
      return null
    }

    // Add all team members as participants
    const participants = memberIds.map(userId => ({
      room_id: room.id,
      user_id: userId
    }))

    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert(participants)

    if (participantError) {
      console.error('Error adding team members to chat:', participantError)
      return null
    }

    // Send welcome message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: room.id,
        sender_id: memberIds[0], // Use first member as sender
        content: `Welcome to the ${teamName} team chat! 🎉`,
        message_type: 'text'
      })

    if (messageError) {
      console.error('Error sending welcome message:', messageError)
    }

    return room
  } catch (error) {
    console.error('Error in createTeamChatRoom:', error)
    return null
  }
}

export async function updateTeamChatRoom(teamId: string, teamName: string, newMemberIds: string[]) {
  try {
    // Find existing team chat room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('team_id', teamId)
      .eq('type', 'team')
      .single()

    if (roomError || !room) {
      console.error('Team chat room not found:', roomError)
      return null
    }

    // Update room name if needed
    const { error: updateError } = await supabase
      .from('chat_rooms')
      .update({
        name: `${teamName} Team Chat`,
        description: `Team chat for ${teamName}`
      })
      .eq('id', room.id)

    if (updateError) {
      console.error('Error updating team chat room:', updateError)
    }

    // Get current participants
    const { data: currentParticipants, error: participantsError } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('room_id', room.id)

    if (participantsError) {
      console.error('Error fetching current participants:', participantsError)
      return null
    }

    const currentMemberIds = currentParticipants?.map(p => p.user_id) || []
    
    // Find members to add and remove
    const membersToAdd = newMemberIds.filter(id => !currentMemberIds.includes(id))
    const membersToRemove = currentMemberIds.filter(id => !newMemberIds.includes(id))

    // Add new members
    if (membersToAdd.length > 0) {
      const newParticipants = membersToAdd.map(userId => ({
        room_id: room.id,
        user_id: userId
      }))

      const { error: addError } = await supabase
        .from('chat_participants')
        .insert(newParticipants)

      if (addError) {
        console.error('Error adding new participants:', addError)
      }
    }

    // Remove members who are no longer in the team
    if (membersToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', room.id)
        .in('user_id', membersToRemove)

      if (removeError) {
        console.error('Error removing participants:', removeError)
      }
    }

    return room
  } catch (error) {
    console.error('Error in updateTeamChatRoom:', error)
    return null
  }
} 