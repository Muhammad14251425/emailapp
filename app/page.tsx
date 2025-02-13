import React from 'react'
import Client from './Client'
import { fetchUsers } from '@/lib/userActions'

const EmailSender = async () => {

  const users = await fetchUsers()

  return (
    <main>
      <Client userList={users} />
    </main>
  )
}

export default EmailSender