import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MovieDetail({ movie }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_MOVIE_API_URL || 'http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com';
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

export default MovieDetail;