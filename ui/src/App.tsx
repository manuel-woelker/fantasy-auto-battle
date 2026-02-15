import { CardBrowser } from "./components/CardBrowser";

function App() {
  return (
    <div style={{ padding: "20px", maxWidth: "100%", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>
        Fantasy Auto Battle - Card Browser
      </h1>
      <CardBrowser />
    </div>
  );
}

export default App;
