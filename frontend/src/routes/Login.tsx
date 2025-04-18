import { redirectToAuthCodeFlow } from "../utils/auth";

function Login() {
    return (
        <div className="login">
            <h2>Press below to authenticate with Spotify</h2>
            <button onClick={() => redirectToAuthCodeFlow()}>Login</button>
            <hr />
            
            <p>If you have not been added manually to the application yet, please fill out the form below. This is required until the application gets approved by Spotify for extended usage. Please note: until this application receives extended usage only 25 users are able access the platofrm.</p>

            <iframe
  src="https://docs.google.com/forms/d/e/1FAIpQLSfYcp3q7SRQiiQDE7ONwNJsKMaUcrIdXzBNnNuTWZ9shkKTzg/viewform?embedded=true"
  width="700"
  height="520"
  frameBorder="0"
  marginHeight={0}
  marginWidth={0}
>
  Loading…
</iframe>
        </div>
    )
}

export default Login