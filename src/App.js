import './App.css';
import { useRef, useState } from 'react';
import DisplayData from './DisplayData';
const { apiToken } = require('./config.json');

function App() {
  const [statusUpdate, setStatusUpdate] = useState('Submit your audio!');
  const [contentSafety, setContentSafety] = useState();
  const [iab, setIAB] = useState();
  const input = useRef();
  const apiUrl = 'https://api.assemblyai.com/v2/transcript';

  const submitAudio = (url) => {

    fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        audio_url: url,
        iab_categories: true,
        content_safety: true,
      }),
      headers: {
        'content-type': 'application/json',
        'authorization': apiToken
      }
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        getTranscript(json.id);
      })
      .catch(error => console.log(error));

  }

  const getTranscript = (id) => {

    fetch(`${apiUrl}/${id}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'authorization': apiToken
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === 'completed') {
          setContentSafety(json.content_safety_labels.summary);
          setIAB(json.iab_categories_result.summary);
          console.log(json);
        } else if (json.status === 'error') {
          console.log(json);
          setStatusUpdate(`There was an error: ${json.error}`);
        } else {
          setStatusUpdate(`Your file is ${json.status}`)
          getTranscript(id);
        }
      })
      .catch(error => console.log(error));
  }

  const clickHandler = (event) => {

    event.preventDefault();
    const userInput = input.current.value;

    submitAudio(userInput);
    input.current.value = '';
    setStatusUpdate('Your file has been submited, please wait.');

  }

  const unpack = object => {
    let displayArray = [];
    Object.entries(object).forEach(entry => {
      const [key, value] = entry;
      console.log(key, value);
      displayArray.push({ tag: key, confidence: value })
    })
    return displayArray;
  }

  let safetyData;
  if (contentSafety) {
    safetyData = unpack(contentSafety);
  }

  let iabData;
  if (iab) {
    iabData = unpack(iab);
  }

  let displaySafety;
  if (safetyData) {
    displaySafety = safetyData.map(obj => <DisplayData tag={obj.tag} conf={Math.round(obj.confidence * 100)} />);
  }

  let displayIAB;
  if (iabData) {
    displayIAB = iabData.map(obj => <DisplayData tag={obj.tag} />);
  }

  return (
    <div className="App">
      <h1>Transcribe</h1>
      <div className='transcript'>
        <p> {statusUpdate} </p>
        <h2>Content Safety Flags</h2>
        <ul>{displaySafety}</ul>
        <h2>IAB Labels</h2>
        <ul>{displayIAB}</ul>
      </div>
      <form onSubmit={clickHandler}>
        <input ref={input} autoComplete='off' type='text' id='url' name='url' placeholder='Paste your URL here' />
        <button type='submit'>Start Transcribing</button>
      </form>
    </div>
  );
}

export default App;
