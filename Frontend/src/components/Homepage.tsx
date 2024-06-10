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
  const [showNewsSummary, setShowNewsSummary] = useState(false);
  const [isHidingSuggestions, setIsHidingSuggestions] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

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
    [searchTopics]
  );

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 2) {
      setShowSuggestions(true);
      debouncedSearch(query);
    } else {
      console.log("Length of the search query is too short!");
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
      }, 300); // Duration of the fade-out animation
    });
  };

  const handleClickOutside = async (event: MouseEvent) => {
    const newsSummaryElement = document.querySelector('.news-summary');
  
    // Check if suggestions list is displayed
    if (showSuggestions) {
      console.log("Suggestions popup is displayed");
      if (
        searchRef.current && !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        await handleFadeOutSuggestions();
      }
    }else{
      console.log("Suggestions popup is not displayed");
      // Check if the click is outside of both the calendar and news summary sections
      if (
        newsSummaryElement && !newsSummaryElement.contains(event.target as Node) &&
        searchRef.current && !searchRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setSelectedInterest(null);
        setShowNewsSummary(false);
      }
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
  }, [showSuggestions, showCalendar]);
  
  
  

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
        }, 300);
      }
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  const handleShowCalendar = () => {
    setShowCalendar((prev) => !prev);
    setShowNewsSummary(true);
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

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(interest);
    setShowNewsSummary(true);
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
            onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
          />
        </div>
        <div className="profile-icon">
          <div onClick={() => navigate('/profile-settings')}>
            👤
          </div>
        </div>
      </header>
      <main className="main-content">
        <section className="interests" style={{ display: !isPortrait || showInterests ? 'block' : 'none' }}>
          <h2>User Interests</h2>
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
          <h2>News Summary</h2>
          {showNewsSummary && (
            <div className={`news-summary-content ${showNewsSummary ? 'fade-in' : ''}`}>
              <div className="calendarContainer">
                <button onClick={handleShowCalendar} className="calendar-button">
                  <FaCalendarAlt />
                </button>
              </div>
              {showCalendar && (
                <div className="datesContainer" ref={calendarRef}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
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
              <div className="news-summary-content-text">
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
          )}
          {!showNewsSummary && (
            <div className="no-interest-message">
              Please select an interest to view news articles and calendar.
            </div>
          )}
        </section>
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
