import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import jwt from "jsonwebtoken";

import GroundScoreApi from './api/gs-api';
import UserContext from './context/UserContext';
import SearchContext from './context/SearchContext';
import useLocalStorage from './customHooks/useLocalStorage';
import NavBar from './routes/NavBar';
import AppRoutes from './routes/AppRoutes';

import './App.css';



export const TOKEN_STORAGE_ID = 'groundscore-token';

function App() {

  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);
  const [searches, setSearches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("empty")
  const [search, setSearch] = useState({});



  /** Handles Login
   * async with boolean return to check if verified.
   */
  async function login(loginData) {
    try {
      let token = await GroundScoreApi.login(loginData);
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
    try {
      let token = await GroundScoreApi.signup(signupData);
      setToken(token);

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



  useEffect(function loadUserInfo() {

    async function getCurrentUser() {
      if (token) {
        try {
          let { username } = jwt.decode(token);
          GroundScoreApi.token = token;
          let currentUser = await GroundScoreApi.getCurrentUser(username);
          setCurrentUser(currentUser);
          setSearches(currentUser.searches);
        } catch (err) {
          console.error("Couldn't log in: ", err);
          setCurrentUser(null);
        }
      }
      setInfoLoaded(true);
    }

    setInfoLoaded(false);
    getCurrentUser();
  }, [token]);

  if (!infoLoaded) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{ currentUser, setCurrentUser, searches, setSearches }}>
        <SearchContext.Provider
          value={{ selected, setSelected, search, setSearch, status, setStatus }} >
          <div className="App">
            <NavBar logout={logout} />
            <AppRoutes login={login} signup={signup} />
          </div>
        </SearchContext.Provider>
      </UserContext.Provider>
    </BrowserRouter >
  );
}

export default App;
