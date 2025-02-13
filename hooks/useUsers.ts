"use client"

import { useState, useEffect } from "react"

interface User {
  name: string
  email: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUsers([
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
        { name: "Bob Johnson", email: "bob@example.com" },
        { name: "Alice Brown", email: "alice@example.com" },
      ])
      setLoading(false)
    }

    fetchUsers()
  }, [])

  return { users, loading }
}

