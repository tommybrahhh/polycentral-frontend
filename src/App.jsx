import React, { useState, useEffect } from 'react'; // Cleaned up import
import axios from 'axios';
// Make sure your style.css is in the src folder
import './style.css'; 

// Main App Component
const App = () => {
  const [view, setView] = useState('events'); // Using useState directly
  const [currentAccount, setCurrentAccount] = useState(null); // Using useState directly

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    checkIfWalletIsConnected();
    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
        } else {
            setCurrentAccount(null);
        }
    };
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    };
  }, []);

  return (
    <div className="app-container">
      <nav className="main-nav">
        <button onClick={() => setView('events')} className={view === 'events' ? 'active' : ''}>
          Events
        </button>
        <button onClick={() => setView('predictions')} className={view === 'predictions' ? 'active' : ''}>
          Predictions
        </button>
        <div className="wallet-container">
          {!currentAccount ? (
            <button onClick={connectWallet} className="wallet-btn">
              Connect Wallet
            </button>
          ) : (
            <p className="wallet-address">
              Connected: {`${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`}
            </p>
          )}
        </div>
      </nav>
      {view === 'events' ? <EventsInterface /> : <PredictionsInterface />}
    </div>
  );
};

// Events Interface Component
const EventsInterface = () => {
  // CORRECT: Define API_URL once for the entire component
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: 100
  });

  const fetchEvents = async () => {
    try {
      // CORRECT: Uses the API_URL constant
      const response = await axios.get(`${API_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Run fetchEvents when the component loads
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      // FIXED: Now uses the API_URL constant
      await axios.post(`${API_URL}/api/events`, newEvent);
      setShowCreateModal(false);
      fetchEvents(); // Refresh the list after creating a new event
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="events-container">
      <div className="header">
        <h2>Manage Events</h2>
        <button onClick={() => setShowCreateModal(true)} className="create-btn">
          + New Event
        </button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  required
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  required
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    required
                    onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({...newEvent, capacity: parseInt(e.target.value, 10)})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <span className="capacity">🎟️ {event.capacity} spots</span>
            </div>
            <p className="description">{event.description}</p>
            <div className="event-details">
              <div className="detail"><span className="icon">📍</span> {event.location}</div>
              <div className="detail"><span className="icon">⏰</span> {new Date(event.start_time).toLocaleDateString()} - {new Date(event.end_time).toLocaleDateString()}</div>
              <div className="detail"><span className="icon">🕒</span> {new Date(event.start_time).toLocaleTimeString()} to {new Date(event.end_time).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Existing Predictions Interface (simplified)
const PredictionsInterface = () => {
  return (
    <div className="predictions-container">
      <h2>Predictions Interface</h2>
      {/* Existing predictions content */}
    </div>
  );
};

// The important thing is to export the component
export default App;