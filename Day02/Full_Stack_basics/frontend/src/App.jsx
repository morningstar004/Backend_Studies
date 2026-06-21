import "./App.css";
import { useState , useEffect} from "react";
import axios from "axios";

function App() {
  const [jokes, setJokes] = useState([]);
  useEffect(() => {
    axios.get("/api/jokes").then((response) => {
      setJokes(response.data)
    }).catch(error => {
      console.error("Error fetching jokes:", error)
    });
  }, []);

  return (
    <>
      <h1>Kojima Is God</h1>
      <p>Jokes: {jokes.length}</p>

      {jokes.map((joke) => {
        return (
          <div key={joke.id}>
            <p>{joke.title}</p>
            <h3>{joke.joke}</h3>
          </div>
        );
      })}
    </>
  );
}

export default App;
