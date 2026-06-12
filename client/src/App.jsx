import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState("stars");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);

    useEffect(() => {
    const storedSearches = JSON.parse(
      localStorage.getItem("recentSearches")
    );

    if (storedSearches) {
      setRecent(storedSearches);
    }
  }, []);

  const searchUser = async () => {

    setLoading(true);
    setError("");
  
    try {
      const response = await axios.get(
        `http://localhost:5000/api/github/${username}`
      );

      setData(response.data);
      const updatedRecent = [
      username,
      ...recent.filter(item => item !== username)
      ].slice(0,5);

setRecent(updatedRecent);

localStorage.setItem(
  "recentSearches",
  JSON.stringify(updatedRecent)
  );

    } catch (error) {
      setError("GitHub User Not Found");
      setData(null);
    }finally {
      setLoading(false);
    }
  };
  const sortedRepos = data
  ? [...data.repos].sort((a, b) => {
      if (sortBy === "stars") {
        return b.stargazers_count - a.stargazers_count;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "updated") {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }

      return 0;
    })
  : [];
  return (
    <div 
      style={{
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f8afc",
        minHeight: "100vh"
      }}
      >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "20px",
          color: "#2563eb",
        }}
      >
        GitHub Repo Explorer
      </h1>

      <input
        type="text"
        placeholder="Enter GitHub Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "8px",
          width: "250px",
          marginRight: "10px",
        }}
      />

      <button
        onClick={searchUser}
        style={{
        padding: "10px 20px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
        }}
      >
       Search
      </button>


        <div style={{ marginTop: "15px" }}>
          <h3>Recent Searches</h3>

        {recent.length === 0 ? (
          <p>No recent searches</p>
        ) : (
          recent.map((item, index) => (
        <button
        key={index}
        onClick={() => {
          setUsername(item);
          searchUser(item);
        

          axios
            .get(`http://localhost:5000/api/github/${item}`)
            .then((response) => {
              setData(response.data);
            });
        }}
        style={{
          margin: "5px",
          padding: "5px 10px",
          cursor: "pointer"
        }}
        >
          {item}
        </button>
        ))
      )}
</div>


      {error && (
      <h3 style={{color:"red"}}>
      {error}
      </h3>
      )}
      {loading && <h2>Loading...</h2>}
      {data && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={data.user.avatar_url}
            width="150"
            alt="avatar"
          />

          <h2>{data.user.name}</h2>

          <p>{data.user.bio}</p>

          <p>
            <strong>Followers:</strong> {data.user.followers}
          </p>

          <p>
            <strong>Following:</strong> {data.user.following}
          </p>

          <p>
            <strong>Public Repositories:</strong>{" "}
            {data.user.public_repos}
          </p>

          <hr />
          <div style={{ margin: "20px" }}>
         <label>
          Sort By:{" "}
          <select
           value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
          <option value="stars">Stars</option>
          <option value="name">Name</option>
          <option value="updated">Last Updated</option>
          </select>
          </label>
          </div>

          <h2>Repositories</h2>

          {sortedRepos.map((repo) => (
            <div
              key={repo.id}
              style={{
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                backgroundColor: "white", 
                borderRadius: "8px",
                padding: "15px",
                margin: "10px auto",
                width: "80%",
                textAlign: "left",
              }}
            >
              <h3>{repo.name}</h3>

              <p>
                {repo.description || "No description available"}
              </p>

              <p>
                <strong>Language:</strong>{" "}
                {repo.language || "Not Specified"}
              </p>

              <p>
                <strong>Stars:</strong> ⭐{" "}
                {repo.stargazers_count}
              </p>

              <p>
                <strong>Updated:</strong>{" "}
                {new Date(
                  repo.updated_at
                ).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;