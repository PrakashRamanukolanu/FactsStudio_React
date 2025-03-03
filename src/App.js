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
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        let query = supabase.from("facts").select("*");
        if (category !== "all") query = query.eq("category", category);
        setIsLoading(true);

        const { data: facts, error } = await query
          .order("votes_like", { ascending: false })
          .limit(20);

        if (!error) setFacts(facts);
        else alert("There was a problem loading the data");
        setIsLoading(false);
      }
      getFacts();
    },
    [category] //This is dependency array
  );
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
        <FilterCategory setCategory={setCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
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
// function isValidUrl(string) {
//   try {
//     new URL(string);
//     return true;
//   } catch (err) {
//     return false;
//   }
// }

function NewFactForm({ setFacts, facts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // Prevent page from reloading.
    e.preventDefault();
    // Check if the Data is valid.

    if (text && isValidUrl(source) && category && textLength <= 200) {
      // Create a FactObj
      // const FactObj = {
      //   id: Math.round(Math.random() * 1000),
      //   text: text,
      //   source: source,
      //   category: category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // Upload fact to Supabase
      setIsUploading(true);
      const { data: FactObj, error } = await supabase
        .from("facts")
        .insert([{ fact: text, source: source, category: category }])
        .select();
      if (error) {
        alert(
          "There was some problem with uploading. Please try after sometime"
        );
      }
      // Add it to the UI.
      else {
        setFacts([FactObj[0], ...facts]);
      }
      setIsUploading(false);
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
        disabled={isUploading}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        value={source}
        disabled={isUploading}
        placeholder="trustworthy source"
        onChange={(e) => setSource(e.target.value)}
      />
      <select
        value={category}
        disabled={isUploading}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Choose a category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function FilterCategory({ setCategory }) {
  return (
    <aside>
      <ul>
        <li>
          <button className="btn btn-all" onClick={() => setCategory("all")}>
            All
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.name}>
            <button
              className="btn btn-category"
              style={{ backgroundColor: category.color }}
              onClick={() => setCategory(category.name)}
            >
              {category.name.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        There are no facts in this category yet. Why don't you add your own.
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the Database.</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votes_like + fact.votes_mindblowing < fact.votes_false;
  async function handleUpvote(votetype) {
    setIsUpdating(true);
    const { data: upvotedFact, error } = await supabase
      .from("facts")
      .update({ [votetype]: fact[votetype] + 1 })
      .eq("id", fact.id)
      .select();
    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? upvotedFact[0] : f))
      );
    setIsUpdating(false);
  }
  return (
    <li key={fact.id} className="facts">
      <p>
        {isDisputed ? <span className="disputed">[DISPUTED⛔️]</span> : null}
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
        <button
          disabled={isUpdating}
          onClick={() => handleUpvote("votes_like")}
        >
          👍 {fact.votes_like}
        </button>
        <button
          disabled={isUpdating}
          onClick={() => handleUpvote("votes_mindblowing")}
        >
          🤯 {fact.votes_mindblowing}
        </button>
        <button
          disabled={isUpdating}
          onClick={() => handleUpvote("votes_false")}
        >
          ⛔️ {fact.votes_false}
        </button>
      </div>
    </li>
  );
}

export default App;
