import axios from "axios";
import https from "https";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// ✅ API to get now playing movies from TMDB API (Fixed IPv6 timeout)
export const getNowPlayingMovies = async (req, res) => {
  try {
    // Disable caching
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    // Call TMDB API with timeout and fallback
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // abort if >8 sec

    const response = await axios.get("https://api.themoviedb.org/3/movie/now_playing", {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      signal: controller.signal,
      timeout: 10000,
      family: 4,
    });
    clearTimeout(timeout);

    if (!response.data?.results?.length) {
      return res.json({ success: false, message: "No movies received from TMDB" });
    }

    return res.json({ success: true, movies: response.data.results });
  } catch (error) {
    console.error("TMDB Fetch Error:", error.message);
    return res.json({
      success: false,
      message:
        error.code === "ECONNABORTED" || error.name === "AbortError"
          ? "TMDB request timed out"
          : error.message,
    });
  }
};


// ✅ API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    // Optionally send Inngest event
    // await inngest.send({
    //   name: "app/show.added",
    //   data: { movieTitle: movie.title },
    // });

    res.json({ success: true, message: "Show added successfully." });
  } catch (error) {
    console.error("Error adding show:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API to get all shows from the database
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMovies = Array.from(
      new Map(
        shows
          .filter((show) => show.movie)
          .map((show) => [show.movie._id.toString(), show.movie])
      ).values()
    );

    res.json({ success: true, movies: uniqueMovies });
  } catch (error) {
    console.error("Error in getShows:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API to get a single movie's showtimes
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("Error in getShow:", error.message);
    res.json({ success: false, message: error.message });
  }
};
