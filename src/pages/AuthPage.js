import React, { useRef, useState } from 'react';
import axios from 'axios';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const emailRef = useRef();
  const passwordRef = useRef();

  const switchModeHandler = () => {
    setIsLogin(prevState => !prevState);
  };

  const submitHandler = async e => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    //graphql query
    let reqBody;

    if (isLogin) {
      reqBody = {
        query: `
        query {
          login(email:"${email}",password:"${password}"){
            userId
            token
            tokenExpiration
          }
        }
      `
      };
    } else {
      reqBody = {
        query: `
        mutation {
          createUser(userInput:{email:"${email}",password:"${password}"}){
            _id
            email
          }
        }
      `
      };
    }

    //ajax request
    try {
      const response = await axios({
        url: `${process.env.REACT_APP_BACKEND_URL}/graphql`,
        method: 'POST',
        data: reqBody,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form className='auth-form' onSubmit={submitHandler}>
      <div className='form-control'>
        <label htmlFor='email'>E-Mail</label>
        <input type='email' id='email' ref={emailRef} />
      </div>
      <div className='form-control'>
        <label htmlFor='password'>Password</label>
        <input type='password' id='pasword' ref={passwordRef} />
      </div>
      <div className='form-actions'>
        <button type='submit'>Submit</button>
        <button type='button' onClick={switchModeHandler}>
          Switch to {isLogin ? 'Signup' : 'Login'}
        </button>
      </div>
    </form>
  );
};

export default AuthPage;
