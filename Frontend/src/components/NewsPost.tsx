import React from 'react';

interface NewsPostProps {
  date: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  url: string;
}

const NewsPost: React.FC<NewsPostProps> = ({ date, title, imageUrl, shortDescription, url }) => {
  return (
    <div className="news-post" onClick={() => window.open(url, '_blank')} style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="overlay"></div>
      <div className="news-post-content">
        <h3>{title}</h3>
        <p>{shortDescription}</p>
      </div>
    </div>
  );
};

export default NewsPost;
