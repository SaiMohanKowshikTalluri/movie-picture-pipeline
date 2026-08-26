/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function MovieList({ onMovieClick }) {
  const [movies, setMovies] = useState([]);

 useEffect(() => {
    const apiUrl = process.env.REACT_APP_MOVIE_API_URL || 'http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com';
    axios.get(`${apiUrl}/movies`).then((response) => {
      setMovies(response.data.movies);
    });
  }, []);

  return (
    <ul>
      {movies.map((movie) => (
        <li className="movieItem" key={movie.id} onClick={() => onMovieClick(movie)}>
          {movie.title}
        </li>
      ))}
    </ul>
  );
}

MovieList.propTypes = {
  onMovieClick: PropTypes.func.isRequired,
};

export default MovieList;