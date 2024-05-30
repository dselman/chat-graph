import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./App.css";
import Page from "./Page";
import Chat from "./Chat";
import "react-chat-elements/dist/main.css"

function HomeContent() {
  return (
    <>
      <div>
        <p>
          Ask a question about a movie or an actor...
        </p>
        <Chat />
      </div>
    </>
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
