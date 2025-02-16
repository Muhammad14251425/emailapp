import React from 'react'
import Client from './Client'
import { fetchUsers } from '@/lib/userActions'
import { getEmails } from '@/lib/getEmails'
import { getGroups } from '@/lib/createGroup'

export const revalidate = 0;

const EmailSender = async () => {

  const users = await fetchUsers();
  const emails = await getEmails();
  const groups = await getGroups();

  return (
    <main>
      <Client userList={users} emails={emails} groups={groups} />
    </main>
  )
}

export default EmailSender