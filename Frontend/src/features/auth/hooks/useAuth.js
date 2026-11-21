import {useContext,useEffect} from 'react'
import {AuthContext} from '../auth.context.jsx'
import {loginUser,registerUser,logoutUser,getMe} from '../services/auth.api.js'

export const useAuth = () => {
    const context = useContext(AuthContext)
    const {user,setUser,loading,setLoading} = context

    const handleLogin = async ({email,password}) => {
        setLoading(true) //mtlb loading state ko true kar do jab login process start ho
        try{
            const data=await loginUser(email, password)
            setUser(data.user)
        } catch (error) {
            console.error('Error during login:', error)
        }
        finally {
            setLoading(false) //mtlb loading state ko false kar do jab login process complete ho
        }
    }

    const handleRegister = async ({username,email,password}) => {
        setLoading(true)
        try {
        const userData=await registerUser(username, email, password)
        setUser(userData.user)
        setLoading(false)
        } catch (error) {
            console.error('Error during registration:', error)
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        await logoutUser()
        setUser(null)
        setLoading(false)
    }

    useEffect(() => {
        const getandSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (error) {
                if (error?.response?.status !== 401) {
                    console.error('Error fetching user data:', error)
                }
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getandSetUser()
    }, [])

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    }
}