import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./App.css";
import Page from "./Page";
import Chat from "./Chat";
import { useEffect, useState } from "react";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

function HomeContent() {
  const [description, setDescription] = useState<string>('Chat with a Knowledge Graph...');
  const [questions, setQuestions] = useState<Array<string>>([]);

  useEffect(() => {
    fetch('/api/description', {
      method: "GET",
      headers: {
        'Content-Type': "application/json",
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (!response.ok || !response.body) {
          alert(response.statusText);
        }
        response.json().then(body => {
          if (body.description) {
            setDescription(body.description);
          }
        })
      });
    fetch('/api/questions', {
      method: "GET",
      headers: {
        'Content-Type': "application/json",
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (!response.ok || !response.body) {
          alert(response.statusText);
        }
        response.json().then(body => {
          if (body.questions) {
            setQuestions(body.questions);
          }
        })
      })
  }, [])

  const questionsList = questions.map((q, index) => {
    return <Paragraph key={index} copyable>{q}</Paragraph>
  })

  return (
    <div className="home">
       <Title level={2}>{description}</Title>
       <Title level={3}>Looking for inspiration?</Title>
      <div className="samples">
        {questionsList}
      </div>
      <Chat/>
    </div >
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{ margin: 10 }}>
        <Link to="/" style={{ padding: 20 }}>
          Home
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Page children={HomeContent()} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
