import apiToken from './config';
import './App.css';
import { useRef, useState } from 'react';

function App() {
  const [statusUpdate, setStatusUpdate] = useState('Submit your audio!');
  const input = useRef();
  const apiUrl = 'https://api.assemblyai.com/v2/transcript';

  const submitAudio = (url) => {

    fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ audio_url: url }),
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
          setStatusUpdate(json.text);
          console.log(json);
        } else {
          getTranscript(id);
        }
      })
      .catch(error => console.log(error));
  }

  const clickHandler = () => {

    const userInput = input.current.value;

    submitAudio(userInput);
    input.current.value = '';
    setStatusUpdate('Your file has been submited, please wait.')

  }

  return (
    <div className="App">
      <h1>Transcribe</h1>
      <div className='transcript'>
        <p> {statusUpdate} </p>
      </div>
      <input ref={input} type='text' id='url' name='url' placeholder='Paste your URL here' />
      <input type='submit' onClick={clickHandler} />
    </div>
  );
}

export default App;
