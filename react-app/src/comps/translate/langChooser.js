import React from 'react';

export default function LanguageChooser(props) {
  const {langs, excluded, onChange, name, selected} = props;
  const filteredLangs = langs.filter(lang => {
    return lang[0] !== excluded;
  }).map(lang => {
    const [shortName, nameObj] = lang;
    return (
      <option
        key={shortName}
        value={shortName}
      >
        {nameObj.name}
      </option>
    )
  });
  return (
    <select
      id={name}
      onChange={onChange}
      value={selected}
    >
      {filteredLangs}
    </select>
  )
}

/**
 Okay, so this component needs to display a list of languages for user
 to select.
 It shouldn't display a single language supplied in the props, which
 allows it to be re-usable for the source and target languages, as in
 source picker should default to English, which is supplied to target
 picker

 I can pick a default source (English) and target (Say, Spanish)
 each is fed into this func as the excluded language

 **/