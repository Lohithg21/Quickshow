import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_BASE_URL;   // ✅ Brave-safe URL

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/show/all`, {
          mode: "cors",
        });

        const data = await res.json();
        console.log("Movies API Response:", data);

        if (data.success && Array.isArray(data.movies)) {
          setMovies(data.movies);
        } else if (data.success && Array.isArray(data.shows)) {
          setMovies(
            data.shows
              .map((show) => show.movie)
              .filter(Boolean)
          );
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Unable to load movies. Please try again later.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-lg font-medium">Loading movies...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold text-red-500">{error}</h1>
      </div>
    );
  }

  return Array.isArray(movies) && movies.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <h1 className="text-lg font-medium my-4">Now Showing</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {movies.map((movie, index) => (
          <MovieCard movie={movie} key={movie._id || movie.id || index} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No movies available</h1>
    </div>
  );
};

export default Movies;
