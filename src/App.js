import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function Loader() {
  return <p className="message">Loading...</p>;
}

function App() {
  const [showForm, setShowform] = useState(false);
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    async function getFacts() {
      setLoading(true);

      const { data: facts, error } = await supabase
        .from("facts")
        .select("*")
        .order("votes_like", { ascending: false })
        .limit(20);

      if (!error) setFacts(facts);
      else alert("There was a problem loading the data");
      setLoading(false);
    }
    getFacts();
  }, []);
  return (
    <>
      <Header setShowForm={setShowform} showForm={showForm} />
      {showForm ? (
        <NewFactForm
          setFacts={setFacts}
          facts={facts}
          setShowForm={setShowform}
        />
      ) : null}
      <main className="main">
        <FilterCategory />
        {loading ? <Loader /> : <FactList facts={facts} />}
      </main>
    </>
  );
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Facts Office Logo" />
        <h1>Facts Studio</h1>
      </div>
      <button
        className="btn btn-large btn-share"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

// Copied from internet
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function NewFactForm({ setFacts, facts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("https://www.google.co.in");
  const [category, setCategory] = useState("");
  const textLength = text.length;

  function handleSubmit(e) {
    // Prevent page from reloading.
    e.preventDefault();
    // Check if the Data is valid.
    if (text && isValidUrl(source) && category && textLength <= 200) {
      console.log("Valid Data");
      // Create a FactObj
      const FactObj = {
        id: Math.round(Math.random() * 1000),
        text: text,
        source: source,
        category: category,
        votesInteresting: 0,
        votesMindblowing: 0,
        votesFalse: 0,
        createdIn: new Date().getFullYear(),
      };
      // Add it to the UI.
      setFacts([FactObj, ...facts]);
      // Reset the form.
      setText("");
      setCategory("");
      //Close the form.
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        placeholder="Share your facts"
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        value={source}
        placeholder="trustworthy source"
        onChange={(e) => setSource(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose a category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large">Post</button>
    </form>
  );
}

function FilterCategory() {
  return (
    <aside>
      <ul>
        <li>
          <button className="btn btn-all">All</button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.name}>
            <button
              className="btn btn-category"
              style={{ backgroundColor: category.color }}
            >
              {category.name.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts }) {
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the Database.</p>
    </section>
  );
}

function Fact({ fact }) {
  return (
    <li key={fact.id} className="facts">
      <p>
        {fact.fact}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
        <span
          className="tag"
          style={{
            backgroundColor: CATEGORIES.find(
              (color) => color.name === fact.category
            ).color,
          }}
        >
          {fact.category}
        </span>
      </p>
      <div className="vote-buttons">
        <button>👍 {fact.votes_like}</button>
        <button>🤯 {fact.votes_mindblowing}</button>
        <button>⛔️ {fact.votes_false}</button>
      </div>
    </li>
  );
}

export default App;
