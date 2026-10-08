import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [currentJoke, setCurrentJoke] = useState(null);
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJoke = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/jokes");
      const joke = response.data;

      setCurrentJoke(joke);
      setJokes((prev) => {
        if (!joke || !joke.id) return prev;

        const alreadyExists = prev.some((item) => item.id === joke.id);
        const nextJokes = alreadyExists ? prev : [joke, ...prev];
        return nextJokes.slice(0, 5);
      });
    } catch (error) {
      console.error("Error fetching joke:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div className="app-container">
      <h1>Joke Generator</h1>

      <div className="joke-card">
        {loading ? (
          <p>Loading a fresh joke...</p>
        ) : currentJoke ? (
          <>
            <p className="joke-title">{currentJoke.title}</p>
            <h3 className="joke-text">{currentJoke.joke}</h3>
          </>
        ) : (
          <p>No joke available right now.</p>
        )}
        <button onClick={fetchJoke} disabled={loading}>
          {loading ? "Loading..." : "Another joke"}
        </button>
      </div>
    </div>
  );
}

export default App;
