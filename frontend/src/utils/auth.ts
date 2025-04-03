import axios from "axios";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SCOPE = import.meta.env.VITE_SPOTIFY_SCOPE;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";


export async function redirectToAuthCodeFlow() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("response_type", "code");
    params.append("redirect_uri", REDIRECT_URI);
    params.append("scope", SCOPE);
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location.href = `${authorizationEndpoint}?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(code: string) {
  const verifier = localStorage.getItem("verifier");

  try {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier!
        });

        const response = await axios.post(tokenEndpoint, params);
        const { access_token, refresh_token } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("token_timestamp", new Date().toISOString());
        console.log("Access Token Retirieved")
  } catch (error) {
        console.error('Error during token retrieval:', error);
        window.location.href = '/';
        alert("Error retrieving key. Please Try Again. If you have not been registered in the application, we cannot use your account yet. As per Spotify's permissions, we must manually add your account. Please fill out the form below.")
  }
}

export async function refreshAccessToken() {
  try {
      const response = await axios.post(tokenEndpoint, new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: localStorage.getItem('refresh_token')!,
      }));

        const { access_token, refresh_token } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("token_timestamp", new Date().toISOString());
        console.log("Access Token Refreshed")
  } catch (error) {
        console.error('Error during token refresh:', error);
        window.location.href = '/';
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_timestamp');
        alert("Error refreshing key. Please Try Again")
  }
}
