import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-icon">📱</div>
        <h1>Student Mobile Usage Survey for WiFi Installation</h1>
        <p className="welcome-subtitle">Legacy University Okija</p>
        
        <div className="welcome-message">
          <p className="time-estimate">⏱️ Just 30 seconds of your precious time</p>
          <p className="description">
            Share your mobile phone usage patterns and preferences as a student.
            Your responses are kept confidential and help improve student services and WiFi.
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Quick & Simple</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Confidential</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Mobile-Friendly</span>
          </div>
        </div>

        <button className="btn btn-primary welcome-start-btn" onClick={onStart}>
          Start Survey →
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
