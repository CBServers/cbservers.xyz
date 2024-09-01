document.addEventListener("DOMContentLoaded", function() {
    fetch("https://servers.brad.stream/api/status")
      .then(response => response.json())
      .then(data => {
        let serverCount = data.length;
        let playerCount = data.reduce((total, server) => total + server.currentPlayers, 0);
        document.getElementById("playerCount").innerHTML = `Join <strong>${playerCount}</strong> players across <strong>${serverCount}</strong> servers!`;
      })
      .catch(error => console.error("Error fetching data:", error));
  });
  