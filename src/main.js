import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import fetch from "isomorphic-fetch";
import querystring from "querystring";

// if .env file is located in some other directory or with some other name
dotenv.config({ path: "../.env" });

// if .env file is located in root directory
dotenv.config();

const {
  SPOTIFY_CLIENT_ID: client_id,
  SPOTIFY_CLIENT_SECRET: client_secret,
  SPOTIFY_REFRESH_TOKEN: refresh_token,
} = process.env;

const spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  refreshToken: refresh_token,
  redirectUri: "http://www.example.com/callback",
});

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  return response.json();
};

async function crawlNetwork(artist_id, step) {
  await new Promise((r) => setTimeout(r, 5000));
  spotifyApi.getArtistRelatedArtists(artist_id).then(
    async function (data) {
      //console.log(data.body.artists.map((a) => a.id));
      var artists_ids = data.body.artists.map((a) => a.id);

      step++;
      console.log(step);

      if (step > 3) {
        console.log("step greater");
        return;
      }

      artists_ids.map((a) => crawlNetwork(a, step));
    },
    function (err) {
      console.error(err);
    }
  );
}

async function main() {
  const token_data = await getAccessToken();

  spotifyApi.setAccessToken(token_data.access_token);

  crawlNetwork("43ZHCT0cAZBISjO8DG9PnE", 1);
}

/////////////////////

main();
