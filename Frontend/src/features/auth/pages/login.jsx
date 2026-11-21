import '../auth.form.scss'
import '../../../style.scss'
import '../../../styles/button.scss'
import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate() //hmne yaha useNavigate hook ka use kiya hai jisse hm login hone ke baad user ko home page pe redirect kar sake.

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here
        await handleLogin({ email, password }) // Call the handleLogin function from the auth context
        navigate('/') // Redirect to the home page after successful login

        if(loading) {
            return <main><h1>Loading...</h1></main>
        }

    }
    if (loading) {
        return <div>Loading...</div>
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email" required placeholder="Enter your Email address" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password" required placeholder="Enter your Password" />
                    </div>
                    <button className="button primary-button">Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
}

export default Login