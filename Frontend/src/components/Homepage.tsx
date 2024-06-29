import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import '../styles/Homepage.css';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_USER_INTERESTS, ADD_INTEREST, REMOVE_INTEREST } from '../mutations/userInterests';
import { SEARCH_TOPICS, HANDLE_NEWS_REQUEST } from '../mutations/topics';
import { VERIFY_TOKEN_QUERY } from '../mutations/registerAndLogin';
import { debounce } from '../utils/debounce';
import NewsPost from './NewsPost';

interface NewsPost {
  date: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  url: string;
}

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);
  const [showInterests, setShowInterests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarClosing, setCalendarClosing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [fadingInterests, setFadingInterests] = useState<string[]>([]);
  const [showNewsSummary, setShowNewsSummary] = useState(false);
  const [isHidingSuggestions, setIsHidingSuggestions] = useState(false);
  const [isFadingOutNewsSummary, setIsFadingOutNewsSummary] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [isFadingOutNewsArticles, setIsFadingOutNewsArticles] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const { data: interestsData, refetch: refetchInterests } = useQuery(GET_USER_INTERESTS);
  const [searchTopics, { data: searchData }] = useLazyQuery(SEARCH_TOPICS);
  const [addInterest] = useMutation(ADD_INTEREST);
  const [removeInterest] = useMutation(REMOVE_INTEREST);
  const [handleNewsRequest] = useMutation(HANDLE_NEWS_REQUEST);
  const [verifyToken] = useLazyQuery(VERIFY_TOKEN_QUERY);

  useEffect(() => {
    setInterests(interestsData?.getUserInterests || []);
  }, [interestsData]);

  useEffect(() => {
    if (searchData) {
      setSuggestions(searchData.searchTopics.map((topic: { name: string }) => topic.name));
    }
  }, [searchData]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchTopics({ variables: { name: query } });
    }, 300),
    [searchTopics]
  );

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 2) {
      setShowSuggestions(true);
      debouncedSearch(query);
    } else {
      await handleFadeOutSuggestions();
    }
  };

  const handleFadeOutSuggestions = async () => {
    setIsHidingSuggestions(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setShowSuggestions(false);
        setIsHidingSuggestions(false);
        resolve();
      }, 300);
    });
  };

  const handleClickOutside = async (event: MouseEvent) => {
    const newsSummaryElement = document.querySelector('.news-summary');
    const interestItemElements = document.querySelectorAll('.interest-item');

    if (showSuggestions) {
      if (
        searchRef.current && !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        await handleFadeOutSuggestions();
      }
    } else {
      const clickedOnInterestItem = Array.from(interestItemElements).some((element) =>
        element.contains(event.target as Node)
      );

      if (
        !clickedOnInterestItem &&
        selectedInterest &&
        newsSummaryElement && !newsSummaryElement.contains(event.target as Node) &&
        searchRef.current && !searchRef.current.contains(event.target as Node)
      ) {
        setCalendarClosing(true);
        setTimeout(() => {
          setShowCalendar(false);
          setCalendarClosing(false);
        }, 300);
        setSelectedInterest(null);
        setIsFadingOutNewsSummary(true);
        setTimeout(() => {
          setShowNewsSummary(false);
          setIsFadingOutNewsSummary(false);
        }, 300);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken().then(({ data }) => {
        if (!data.verifyToken) {
          localStorage.removeItem('token');
          navigate('/', { replace: true });
        }
      }).catch(() => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, verifyToken]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = (e: MediaQueryListEvent) => setIsPortrait(e.matches);

    mediaQuery.addEventListener('change', handleOrientationChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, showCalendar, selectedInterest]);

  const handleAddInterest = async (interestName: string) => {
    try {
      const { data } = await addInterest({ variables: { interestName } });
      if (data.addInterest) {
        await handleFadeOutSuggestions();
        refetchInterests();
        setSearchTerm('');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  const handleRemoveInterest = async (interestName: string) => {
    try {
      const { data } = await removeInterest({ variables: { interestName } });
      if (data.removeInterest) {
        setFadingInterests((prev) => [...prev, interestName]);
        setTimeout(() => {
          setInterests((prevInterests) => prevInterests.filter((interest) => interest !== interestName));
          setFadingInterests((prev) => prev.filter((interest) => interest !== interestName));
          refetchInterests();

          if (selectedInterest === interestName) {
            setCalendarClosing(true);
            setTimeout(() => {
              setShowCalendar(false);
              setCalendarClosing(false);
            }, 300);
            setSelectedInterest(null);
            setIsFadingOutNewsSummary(true);
            setTimeout(() => {
              setShowNewsSummary(false);
              setIsFadingOutNewsSummary(false);
            }, 300);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  const handleShowCalendar = () => {
    if (showCalendar) {
      setCalendarClosing(true);
      setTimeout(() => {
        setShowCalendar(false);
        setCalendarClosing(false);
      }, 300);
    } else {
      setShowCalendar(true);
    }
  };

  const handleInterestClick = (interest: string) => {
    if (selectedInterest === interest) {
      setSelectedInterest(null);
      setShowNewsSummary(false);
      setNewsArticles([]);
    } else {
      setIsFadingOutNewsArticles(true);
      setTimeout(() => {
        setNewsArticles([]);
        setIsFadingOutNewsArticles(false);
        setSelectedInterest(interest);
        setShowCalendar(false);
        setShowNewsSummary(true);
      }, 300);
    }
    if (isPortrait) {
      setShowInterests(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date && selectedInterest) {
      console.log(`Selected date: ${date.toDateString()}, Selected interest: ${selectedInterest}`);
    }
  };

  const handleConfirmDate = async () => {
    if (selectedDate && selectedInterest) {
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const { data } = await handleNewsRequest({
          variables: {
            topicName: selectedInterest,
            date: formattedDate,
          },
        });

        if (data.handleNewsRequest.success) {
          setNewsArticles(data.handleNewsRequest.newsPosts);
        } else {
          setNewsArticles([]);
        }
        setCalendarClosing(true);
        setTimeout(() => {
          setShowCalendar(false);
          setCalendarClosing(false);
        }, 300);
      } catch (error) {
        setNewsArticles([]);
        console.error('Error handling news request:', error);
      }
    }
  };

  const handleBurgerClick = () => {
    if (isPortrait) {
      setShowInterests((prev) => !prev);
      setShowNewsSummary(false);
    }
  };

  return (
    <div className="homepage-container">
      <header className="header">
        {isPortrait ? (
          <div className="burger-menu-container">
            <button className="burger-menu" onClick={handleBurgerClick}>
              {showInterests ? '✖' : '☰'}
            </button>
          </div>
        ) : (
          <div className="search-bar-container">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search news topics..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
              className="search-bar"
            />
          </div>
        )}
        <div className="right-container">
          {isPortrait && showInterests ? (
            <div className="search-bar-container">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search news topics..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
                className="search-bar"
              />
            </div>
          ) : (
            <div className="profile-icon" onClick={() => navigate('/profile-settings')}>
              👤
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {isPortrait ? (
          !selectedInterest && !showInterests ? (
            <div className="default-message">
              <h2>Please select an interest to see news articles</h2>
            </div>
          ) : (
            <>
              {showInterests && (
                <section className="interests">
                  <h2>Topics of Interest</h2>
                  <div className="interests-section">
                    {interests.length ? (
                      <div className="interests-container">
                        {interests.map((interest, index) => (
                          <div
                            key={index}
                            className={`interest-item ${selectedInterest === interest ? 'selected' : ''} ${fadingInterests.includes(interest) ? 'fade-out' : ''}`}
                            onClick={() => handleInterestClick(interest)}
                          >
                            <span>{interest}</span>
                            <button className="remove-button" onClick={(e) => { e.stopPropagation(); handleRemoveInterest(interest); }}>x</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-interest-message">No interests found.</div>
                    )}
                  </div>
                </section>
              )}
              {showNewsSummary && (
                <section className="news-summary">
                  <h2>News Articles</h2>
                  <div className={`news-summary-content ${showNewsSummary ? 'fade-in' : ''} ${isFadingOutNewsSummary ? 'fade-out' : ''}`}>
                    <div className="calendarContainer">
                      <button onClick={handleShowCalendar} className="calendar-button">
                        <FaCalendarAlt />
                      </button>
                    </div>
                    {showCalendar && (
                      <div className={`datesContainer ${calendarClosing ? 'fade-out-calendar' : 'show'}`} ref={calendarRef}>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          inline
                          renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
                            <div className="custom-header">
                              <button onClick={decreaseYear}>{'<<'}</button>
                              <button onClick={decreaseMonth}>{'<'}</button>
                              <span>
                                {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                              </span>
                              <button onClick={increaseMonth}>{'>'}</button>
                              <button onClick={increaseYear}>{'>>'}</button>
                            </div>
                          )}
                        />
                        <button className="confirm-button" onClick={handleConfirmDate}>Confirm</button>
                      </div>
                    )}
                    <div className={`news-articles ${isFadingOutNewsArticles ? 'fade-out' : ''}`}>
                      {selectedDate && newsArticles.length > 0 ? (
                        newsArticles.map((article, index) => (
                          <div
                            key={index}
                            className="news-post"
                            style={{ backgroundImage: `url(${article.imageUrl})` }}
                          >
                            <NewsPost
                              date={article.date}
                              title={article.title}
                              imageUrl={article.imageUrl}
                              shortDescription={article.shortDescription}
                              url={article.url}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="no-articles-message">
                          {selectedDate ? 'No news articles found for the selected date.' : 'Please select a date from the calendar.'}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </>
          )
        ) : (
          <>
            <section className="interests">
              <h2>Topics of Interest</h2>
              <div className="interests-section">
                {interests.length ? (
                  <div className="interests-container">
                    {interests.map((interest, index) => (
                      <div
                        key={index}
                        className={`interest-item ${selectedInterest === interest ? 'selected' : ''} ${fadingInterests.includes(interest) ? 'fade-out' : ''}`}
                        onClick={() => handleInterestClick(interest)}
                      >
                        <span>{interest}</span>
                        <button className="remove-button" onClick={(e) => { e.stopPropagation(); handleRemoveInterest(interest); }}>x</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-interest-message">No interests found.</div>
                )}
              </div>
            </section>
            <section className="news-summary">
              <h2>News Articles</h2>
              <div className={`news-summary-content ${showNewsSummary ? 'fade-in' : ''} ${isFadingOutNewsSummary ? 'fade-out' : ''}`}>
                <div className="calendarContainer">
                  <button onClick={handleShowCalendar} className="calendar-button">
                    <FaCalendarAlt />
                  </button>
                </div>
                {showCalendar && (
                  <div className={`datesContainer ${calendarClosing ? 'fade-out-calendar' : 'show'}`} ref={calendarRef}>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      inline
                      renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
                        <div className="custom-header">
                          <button onClick={decreaseYear}>{'<<'}</button>
                          <button onClick={decreaseMonth}>{'<'}</button>
                          <span>
                            {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                          </span>
                          <button onClick={increaseMonth}>{'>'}</button>
                          <button onClick={increaseYear}>{'>>'}</button>
                        </div>
                      )}
                    />
                    <button className="confirm-button" onClick={handleConfirmDate}>Confirm</button>
                  </div>
                )}
                <div className={`news-articles ${isFadingOutNewsArticles ? 'fade-out' : ''}`}>
                  {selectedDate && newsArticles.length > 0 ? (
                    newsArticles.map((article, index) => (
                      <div
                        key={index}
                        className="news-post"
                        style={{ backgroundImage: `url(${article.imageUrl})` }}
                      >
                        <NewsPost
                          date={article.date}
                          title={article.title}
                          imageUrl={article.imageUrl}
                          shortDescription={article.shortDescription}
                          url={article.url}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="no-articles-message">
                      {selectedDate ? 'No news articles found for the selected date.' : 'Please select a date from the calendar.'}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      {showSuggestions && (
        <div className={`suggestions-popup ${isHidingSuggestions ? 'fadeOut' : ''}`} ref={suggestionsRef} onAnimationEnd={() => {
          if (isHidingSuggestions) {
            setShowSuggestions(false);
            setIsHidingSuggestions(false);
          }
        }}>
          <ul className="suggestions-list">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} className="suggestion-item" onClick={() => handleAddInterest(suggestion)}>
                {suggestion}
              </li>
            ))}
            {searchTerm.length > 0 && (
              <li className="suggestion-item" onClick={() => handleAddInterest(searchTerm)}>
                {`Add "${searchTerm}"`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Homepage;
