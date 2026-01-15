import React from 'react';

const Rating = ({
  rating = 0,
  reviews = 0,
  size = 20,
  color = '#ffffffff',
}) => {
  if (reviews === 0) {
    return (
      <div style={styles.container}>
        <span style={styles.noRatings}>
          No reviews yet — be the first to share your experience!
        </span>
      </div>
    );
  }

  // Round rating to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  const renderStar = (type, key) => {
    const starProps = {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: 2,
      key,
    };

    if (type === 'full') {
      return (
        <svg {...starProps} fill={color}>
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
        </svg>
      );
    } else if (type === 'half') {
      return (
        <svg {...starProps}>
          <defs>
            <linearGradient id={`halfGrad${key}`}>
              <stop offset='50%' stopColor={color} />
              <stop offset='50%' stopColor='transparent' />
            </linearGradient>
          </defs>
          <polygon
            points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'
            fill={`url(#halfGrad${key})`}
          />
        </svg>
      );
    } else {
      return (
        <svg {...starProps}>
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
        </svg>
      );
    }
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(roundedRating)) {
      stars.push(renderStar('full', i));
    } else if (i === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
      stars.push(renderStar('half', i));
    } else {
      stars.push(renderStar('empty', i));
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.stars}>{stars}</div>
      <span style={styles.text}>
        {roundedRating} ({reviews} {reviews === 1 ? 'Review' : 'Reviews'})
      </span>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    color: '#fff',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  text: {
    fontSize: '16px',
    color: '#fff',
  },
  noRatings: {
    fontSize: '16px',
    color: '#bbb',
    fontStyle: 'italic',
  },
};

export default Rating;
