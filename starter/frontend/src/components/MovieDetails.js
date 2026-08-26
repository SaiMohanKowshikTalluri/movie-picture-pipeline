import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function MovieDetail({ movie }) {
  const [details, setDetails] = useState(null);
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_MOVIE_API_URL || 'http://127.0.0.1:5000';
    axios.get(`${apiUrl}/movies/${movie.id}`).then((response) => {
      setDetails(response.data);
    });
  }, [movie]);

  return (
    <div>
      <h2>{details?.movie.title}</h2>
      <p>{details?.movie.description}</p>
    </div>
  );
}

MovieDetail.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
};

export default MovieDetail;
