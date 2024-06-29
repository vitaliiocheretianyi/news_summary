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
    <div className="article">
      <h3>{title}</h3>
      <img src={imageUrl} alt={title} />
      <p>{shortDescription}</p>
      <a href={url} target="_blank" rel="noopener noreferrer">Read more</a>
    </div>
  );
};

export default NewsPost;
