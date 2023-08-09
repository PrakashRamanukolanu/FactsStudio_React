import "./style.css";

function App() {
  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="logo.png" alt="Facts Office Logo" />
          <h1>Facts Studio</h1>
        </div>
        <button className="btn btn-large btn-share">Share a fact</button>
      </header>
      <NewFactForm />
      <main className="main">
        <FilterCategory />
        <FactList />
      </main>
    </>
  );
}

function NewFactForm() {
  return <form className="fact-form">New Fact Form here..</form>;
}

function FilterCategory() {
  return <aside>Categories here</aside>;
}

function FactList() {
  return <section>List of facts goes here..</section>;
}

export default App;
