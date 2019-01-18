import React from 'react'

import './auth.css'

/**
 *
 * @param props
 * username, password, errText
 *  The above are text values, used to save user input into state
 *  or display error text
 * onChange, onSubmit
 *  Method handlers
 * @return {HTMLDivElement}
 */
export default function Auth(props) {
  const {username, password, onChange, onSubmit} = props;
  return (
    <div id="auth-container">
      <form id="auth-form">
        <input
          id="username"
          type="text"
          value={username}
          placeholder="Username"
          onChange={onChange}
          onSubmit={null}
        />
        <input
          id="password"
          type="password"
          value={password}
          placeholder="Password"
          onChange={onChange}
          onSubmit={null}
        />
        <input
          id="registrationCheckbox"
          type="checkbox"
          onClick={onChange}
          onToggle={onChange}
          onSubmit={null}
        />
        <label
          htmlFor="registrationCheckbox"
        >
          Register?
        </label>
        <input
          type="submit"
          value="submit"
          onClick={onSubmit}
        />
      </form>
      {/*{err}*/}
    </div>
  )
}