import React, { useState } from 'react';

const TextForm = (props: { onSubmit: (text: string) => void }) => {
  const [text, setText] = useState('');
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text === '') return;
    props.onSubmit(text);
  };
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="rename">Rename</label>
      <input type="text" id="rename" name="rename" onChange={(e) => setText(e.target.value)} />
      <button type="submit">Enter</button>
    </form>
  );
};

export default TextForm;
