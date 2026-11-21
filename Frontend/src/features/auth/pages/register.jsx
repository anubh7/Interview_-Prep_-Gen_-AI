import {Link} from 'react-router'
import {useState} from 'react'
import {useAuth} from '../hooks/useAuth.js'
import {useNavigate} from 'react-router'

const Register = () => {
  
  const navigate = useNavigate() //hmne yaha useNavigate hook ka use kiya hai jisse hm register hone ke baad user ko home page pe redirect kar sake.
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {loading, handleRegister} = useAuth() //this is used to access the handleRegister function from the auth context which will be used to register the user with the provided username, email, and password
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    await handleRegister({username, email, password}) // Call the handleRegister function from the auth context because we want to register the user with the provided username, email, and password
    navigate('/') // Redirect to the home page after successful registration
  } 
  if (loading) {
    return <main><h1>Loading....</h1></main>
  }

  return (
     <main>
        <div className="form-container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input 
                        onChange={(e) => setUsername(e.target.value)}
                        type="text" id="username" name="username" required placeholder="Enter your Username" />      
                </div>
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
                <button className="button primary-button">Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    </main>
  )
}

export default Register