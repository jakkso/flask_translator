import React from 'react';

import './errText.css'


export default function ErrText(props) {
  const text = props.text;
  return (
    <div>
      {text}
    </div>
  )
}
