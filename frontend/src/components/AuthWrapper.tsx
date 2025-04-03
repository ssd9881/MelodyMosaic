import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../utils/auth";
import { updateUser } from "../utils/backend_api_handler";
import { plainToInstance } from "class-transformer";
import User from "../Classes/User";

const AuthWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [refreshing, setRefreshing] = useState(false);
    
    useEffect(() => {
      const userInfo = localStorage.getItem('user');
      const tokenTimestamp = localStorage.getItem('token_timestamp');
      const userIsAuthenticated = Boolean(userInfo);

      if (tokenTimestamp) {
        const timestampDate = new Date(tokenTimestamp);
        const currentDate = new Date();
        const hoursDifference = Math.abs(currentDate.getTime() - timestampDate.getTime()) / 36e5;
        if (hoursDifference > 1) {
          // Token is more than 4 hours old, log the user out
          if (!refreshing) {
            setRefreshing(true);
            localStorage.removeItem('token_timestamp');
            console.log("Token expired, refreshing out...");
            refreshAccessToken().then(() => updateUser(plainToInstance(User, userInfo)));
          }
        }
      }

      if (userIsAuthenticated && location.pathname === '/') {
        navigate('/dashboard');
        return;
      }
  
      // Redirect to login page if user is not authenticated and not already on the login page
      if (!userIsAuthenticated && location.pathname !== '/') {
        navigate('/');
        return;
      }
    }, [navigate, location.pathname, setRefreshing, refreshing, refreshAccessToken, updateUser]);
  
    return <>{children}</>;
  };
  
  export default AuthWrapper;
  