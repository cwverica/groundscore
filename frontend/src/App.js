import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import UserContext from './auth/UserContext';
import useLocalStorage from './customHooks/useLocalStorage';
import NavBar from './routes/NavBar';
import AppRoutes from './routes/AppRoutes';

import './App.css';



export const TOKEN_STORAGE_ID = 'groundscore-token';

function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  /** A function used in development to test things, once useless, delete */
  function popup(data) {
    if (Object.prototype.toString(data) === "[object Object]") {
      window.alert(`You entered "${Object.keys(data).map((key) => `${key}: ${data[key]}`)}"`);
    } else {
      window.alert(`You entered "${data}"`)
    }

  }


  /** Handles Login
   * async with boolean return to check if verified.
   */
  async function login(loginData) {
    try {
      // let token = await JoblyApi.login(loginData);
      // do login stuff here
      setToken(token);
      return { success: true };
    } catch (errors) {
      console.error("login failed: ", errors);
      return { success: false, errors };
    }
  }


  /** Handles signup
  * automatically logs user in
  * 
  * async with boolean return, await response before proceeding
  */
  async function signup(signupData) {
    const { username, password, firstName, lastName, email } = signupData;
    try {
      // let token = await JoblyApi.signup(signupData);
      // do signup stuff here
      // setToken(token);
      window.alert(`You have signed up with:\n\t
                      username: ${username}\n\t
                      name: ${firstName} ${lastName}\n\t
                      password: ${'*' * password.length}
                      email: ${email}`)
      return { success: true };
    } catch (errors) {
      console.error("Signup failed:", errors);
      return { success: false, errors };
    }
  }


  /** site-wide available logout function */
  function logout() {
    setCurrentUser(null);
    setToken(null);
  }


  /** Finds saved searches for logged in user */
  async function savedSearches() {
    // if not logged in:
    return false;
    // else return searches
  }


  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{ currentUser, setCurrentUser, savedSearches }}>
        <div className="App">
          <NavBar logout={logout} />
          <AppRoutes login={login} signup={signup} />
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
