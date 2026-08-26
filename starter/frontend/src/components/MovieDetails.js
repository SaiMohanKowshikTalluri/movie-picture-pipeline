/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function MovieDetail({ movie }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!movie) return;
    const apiUrl =
      process.env.REACT_APP_MOVIE_API_URL ||
      'http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com';
    axios.get(`${apiUrl}/movies/${movie.id}`).then((response) => {
      setDetails(response.data);
    });
  }, [movie]);

  if (!movie) {
    return <div>Select a movie from the list to view details.</div>;
  }

  if (!details) {
    return <div>Loading details...</div>;
  }

  return (
    <div>
      <h2>{details.movie.title}</h2>
      <p>{details.movie.description}</p>
    </div>
  );
}

MovieDetail.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
  }),
};

export default MovieDetail;