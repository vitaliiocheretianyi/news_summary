import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import '../styles/Homepage.css';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_USER_INTERESTS, ADD_INTEREST, REMOVE_INTEREST } from '../mutations/userInterests';
import { SEARCH_TOPICS } from '../mutations/topics';
import { debounce } from '../utils/debounce';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);
  const [showInterests, setShowInterests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [fadingInterests, setFadingInterests] = useState<string[]>([]);
  const [fadingSuggestions, setFadingSuggestions] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: interestsData, refetch: refetchInterests } = useQuery(GET_USER_INTERESTS);
  const [searchTopics, { data: searchData }] = useLazyQuery(SEARCH_TOPICS);
  const [addInterest] = useMutation(ADD_INTEREST);
  const [removeInterest] = useMutation(REMOVE_INTEREST);

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
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowSuggestions(query.length > 2);
    if (query.length > 2) debouncedSearch(query);
    else setSuggestions([]);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node)
    ) {
      setFadingSuggestions(true);
      setTimeout(() => {
        setShowSuggestions(false);
        setFadingSuggestions(false);
      }, 300); // Duration of fade-out animation
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = (e: MediaQueryListEvent) => setIsPortrait(e.matches);

    mediaQuery.addEventListener('change', handleOrientationChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddInterest = async (interestName: string) => {
    try {
      const { data } = await addInterest({ variables: { interestName } });
      if (data.addInterest) {
        refetchInterests();
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
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
          refetchInterests(); // Call refetch to ensure the data is consistent with the backend
        }, 300); // Duration of fade-out animation
      }
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  const handleShowCalendar = () => {
    setShowCalendar((prev) => !prev);
    document.querySelector('.news-summary-content')?.classList.toggle('move-down', !showCalendar);
  };

  const highlightWeek = (date: Date) => {
    const start = date.getDate() - date.getDay();
    const end = start + 6;
    const highlightDates = [];
    for (let i = start; i <= end; i++) {
      const day = new Date(date);
      day.setDate(i);
      highlightDates.push(day);
    }
    return highlightDates;
  };

  const handleFocusSearch = () => {
    if (searchTerm.length > 2) {
      setFadingSuggestions(false);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="homepage-container">
      <header className="header">
        {isPortrait && (
          <div className="burger-menu" onClick={() => setShowInterests((prev) => !prev)}>
            {showInterests ? '✖' : '☰'}
          </div>
        )}
        <div className="search-bar">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search news topics..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleFocusSearch}
          />
        </div>
        <div className="profile-icon" onClick={() => navigate('/profile-settings')}>
          👤
        </div>
      </header>
      <main className="main-content">
        <section className="interests" style={{ display: !isPortrait || showInterests ? 'block' : 'none' }}>
          <h2>User Interests</h2>
          <div className="interests-container">
            {interests.length > 0 ? (
              interests.map((interest: string, index: number) => (
                <div
                  key={index}
                  data-interest={interest}
                  className={`interest-item ${selectedInterest === interest ? 'selected' : ''} ${fadingInterests.includes(interest) ? 'fade-out' : ''}`}
                  onClick={() => setSelectedInterest(interest)}
                >
                  <span>{interest}</span>
                  <button className="remove-button" onClick={(e) => { e.stopPropagation(); handleRemoveInterest(interest); }}>x</button>
                </div>
              ))
            ) : (
              <div>No interests found.</div>
            )}
          </div>
        </section>
        {!showInterests && (
          <section className="news-summary">
            <h2>News Summary</h2>
            <div className="calendarContainer">
              <button onClick={handleShowCalendar} className="calendar-button">
                <FaCalendarAlt />
              </button>
            </div>
            {showCalendar && (
              <div className="datesContainer">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
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
                  highlightDates={highlightWeek(selectedDate!)}
                />
                <button className="confirm-button">Confirm</button>
              </div>
            )}
            <div className={`news-summary-content ${showCalendar ? 'move-down' : ''}`}>
              <div className='news-summary-content-text'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum dui magna, congue id pharetra non, tristique eget tortor. Morbi lacinia sapien ac justo iaculis facilisis. Vivamus rhoncus mauris ut feugiat porta. Interdum et malesuada fames ac ante ipsum primis in faucibus. In id auctor tellus. Donec diam magna, facilisis eget eros sit amet, dignissim scelerisque eros. Nulla facilisi. Praesent vel congue quam.
              </div>
              <div className="news-articles">
                <div className="article">Lorem ipsum dolor sit amet...</div>
                <div className="article">Lorem ipsum dolor sit amet...</div>
                <div className="article">Lorem ipsum dolor sit amet...</div>
                <div className="article">Lorem ipsum dolor sit amet...</div>
                <div className="article">Lorem ipsum dolor sit amet...</div>
                <div className="article">Lorem ipsum dolor sit amet...</div>
              </div>
            </div>
          </section>
        )}
      </main>
      {showSuggestions && searchTerm && (
        <div className={`suggestions-popup ${fadingSuggestions ? 'fadeOut' : ''}`} ref={suggestionsRef}>
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
