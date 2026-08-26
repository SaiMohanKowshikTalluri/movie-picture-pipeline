/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function MovieList({ onMovieClick }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_MOVIE_API_URL || 'http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com';
    axios.get(`${apiUrl}/movies`)
      .then((response) => {
        // Handles both direct arrays and object wrappers just in case
        const movieData = Array.isArray(response.data) ? response.data : response.data.movies;
        setMovies(movieData || []);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }, []);

  return (
    <div>
      <ul>
        {movies && movies.map((movie) => (
          <li className="movieItem" key={movie.id} onClick={() => onMovieClick(movie)}>
            {movie.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

MovieList.propTypes = {
  onMovieClick: PropTypes.func.isRequired,
};

export default MovieList;