import { useAuth } from '../hooks/useAuth.js'
import { Navigate } from 'react-router'

const Protected = ({children}) => {
    const {user, loading} = useAuth() //hmne yaha useAuth hook ka use kiya hai jisse hm user data aur loading state ko access kar sake.
    if (loading) {
        return <main><h1>Loading...</h1></main>
    }
    if (!user) {
        return <Navigate to="/login" /> // Redirect to login page if user is not authenticated
    }
  return (
    <main>
        {children}
    </main>
    
  )
}

export default Protected