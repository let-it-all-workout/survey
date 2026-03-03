import { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import WelcomeScreen from './WelcomeScreen';
import { submitResponse } from '../utils/api';
import './SurveyForm.css';

const SurveyForm = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const surveyUrl = window.location.origin + window.location.pathname;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = surveyUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hey! Please take 30 seconds to fill this quick survey for WiFi installation at Legacy University Okija 📱\n\n${surveyUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('surveyProgress');
    const savedStep = localStorage.getItem('surveyStep');
    
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('surveyProgress', JSON.stringify(formData));
    localStorage.setItem('surveyStep', currentStep.toString());
  }, [formData, currentStep]);

  const surveyQuestions = [
    {
      id: 'matric_number',
      question: 'Enter your matric number',
      type: 'text',
      required: true,
      placeholder: 'e.g. 2002/CSC/012'
    },
    {
      id: 'department',
      question: 'What is your department?',
      type: 'select',
      required: true,
      options: [
        { value: 'Biochemistry', label: 'Biochemistry' },
        { value: 'Botany', label: 'Botany' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Systems', label: 'Information Systems' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Industrial Mathematics', label: 'Industrial Mathematics' },
        { value: 'Microbiology', label: 'Microbiology' },
        { value: 'Physics with Electronics', label: 'Physics with Electronics' },
        { value: 'Zoology', label: 'Zoology' },
        { value: 'Accounting', label: 'Accounting' },
        { value: 'Banking & Finance', label: 'Banking & Finance' },
        { value: 'Business Administration', label: 'Business Administration' },
        { value: 'Economics', label: 'Economics' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Public Administration', label: 'Public Administration' },
        { value: 'English Language', label: 'English Language' },
        { value: 'History', label: 'History' },
        { value: 'Mass Communication', label: 'Mass Communication' },
        { value: 'Political Science', label: 'Political Science' },
        { value: 'Sociology', label: 'Sociology' },
        { value: 'Nursing', label: 'Nursing' },
        { value: 'Public Health', label: 'Public Health' },
        { value: 'Other', label: 'Other' }
      ],
      hasOtherField: true
    },
    {
      id: 'level',
      question: 'What is your current level?',
      type: 'select',
      required: true,
      options: [
        { value: '100 Level', label: '100 Level' },
        { value: '200 Level', label: '200 Level' },
        { value: '300 Level', label: '300 Level' },
        { value: '400 Level', label: '400 Level' },
        { value: '500 Level', label: '500 Level' }
      ]
    },
    {
      id: 'gender',
      question: 'What is your gender?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {
      id: 'hours_per_day',
      question: 'On average, how many hours per day do you use your mobile phone?',
      type: 'select',
      required: true,
      options: [
        { value: 'Less than 1 hour', label: 'Less than 1 hour' },
        { value: '1-3 hours', label: '1-3 hours' },
        { value: '4-6 hours', label: '4-6 hours' },
        { value: '7-9 hours', label: '7-9 hours' },
        { value: '10+ hours', label: '10+ hours' }
      ]
    },
    {
      id: 'primary_uses',
      question: 'What do you mostly use your mobile phone for? (Select all that apply)',
      type: 'checkbox',
      required: true,
      options: [
        { value: 'Academic research', label: 'Academic research' },
        { value: 'Social media', label: 'Social media' },
        { value: 'Entertainment (videos, games)', label: 'Entertainment (videos, games)' },
        { value: 'Communication (calls, messages)', label: 'Communication (calls, messages)' },
        { value: 'Online learning', label: 'Online learning' },
        { value: 'Banking & Shopping', label: 'Banking & Shopping' },
        { value: 'News', label: 'News' }
      ]
    },
    {
      id: 'lecture_distraction',
      question: 'How often do you use your phone during lectures?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Never', label: 'Never' },
        { value: 'Rarely', label: 'Rarely' },
        { value: 'Sometimes', label: 'Sometimes' },
        { value: 'Often', label: 'Often' },
        { value: 'Always', label: 'Always' }
      ]
    },
    {
      id: 'academic_performance',
      question: 'How has your mobile phone usage affected your academic performance?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Significantly improved', label: 'Significantly improved' },
        { value: 'Somewhat improved', label: 'Somewhat improved' },
        { value: 'No effect', label: 'No effect' },
        { value: 'Somewhat decreased', label: 'Somewhat decreased' },
        { value: 'Significantly decreased', label: 'Significantly decreased' }
      ]
    },
    {
      id: 'concentration',
      question: 'Do you find it hard to concentrate on studies because of your phone?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Never', label: 'Never' },
        { value: 'Rarely', label: 'Rarely' },
        { value: 'Sometimes', label: 'Sometimes' },
        { value: 'Often', label: 'Often' },
        { value: 'Always', label: 'Always' }
      ]
    },
    {
      id: 'sleep_impact',
      question: 'Has phone usage affected your sleep or rest?',
      type: 'radio',
      required: true,
      options: [
        { value: 'No, I sleep fine', label: 'No, I sleep fine' },
        { value: 'Slightly, I sometimes sleep late', label: 'Slightly, I sometimes sleep late' },
        { value: 'Yes, I often stay up too late', label: 'Yes, I often stay up too late' },
        { value: 'Seriously, it affects my next day', label: 'Seriously, it affects my next day' }
      ]
    },
    {
      id: 'social_impact',
      question: 'Has your phone usage reduced your face-to-face interactions with friends?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Not at all', label: 'Not at all' },
        { value: 'A little', label: 'A little' },
        { value: 'Somewhat', label: 'Somewhat' },
        { value: 'A lot', label: 'A lot' }
      ]
    },
    {
      id: 'health_issues',
      question: 'Have you noticed any of these since using your phone frequently? (Select all that apply)',
      type: 'checkbox',
      required: false,
      options: [
        { value: 'Eye strain', label: 'Eye strain' },
        { value: 'Headaches', label: 'Headaches' },
        { value: 'Neck/back pain', label: 'Neck/back pain' },
        { value: 'Poor sleep', label: 'Poor sleep' },
        { value: 'Anxiety when without phone', label: 'Anxiety when without phone' },
        { value: 'None', label: 'None of these' }
      ]
    },
    {
      id: 'dependency',
      question: 'How would you feel if you had to go a full day without your phone?',
      type: 'radio',
      required: true,
      options: [
        { value: 'Totally fine', label: 'Totally fine' },
        { value: 'A bit uncomfortable', label: 'A bit uncomfortable' },
        { value: 'Very uncomfortable', label: 'Very uncomfortable' },
        { value: 'Cannot imagine it', label: 'Cannot imagine it' }
      ]
    },
    {
      id: 'recommendations',
      question: 'Any short recommendation for improving student mobile and WiFi support?',
      type: 'textarea',
      required: false
    }
  ];

  const totalSteps = surveyQuestions.length;

  const handleChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = surveyQuestions[currentStep];
    
    // Validate required fields
    if (currentQuestion.required) {
      const value = formData[currentQuestion.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        alert('Please answer this question before proceeding.');
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top smoothly
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSubmit = async () => {
    const currentQuestion = surveyQuestions[currentStep];
    
    // Validate required fields
    if (currentQuestion.required) {
      const value = formData[currentQuestion.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        alert('Please answer this question before submitting.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitResponse(formData);
      setIsSubmitted(true);
      
      // Clear form data and progress
      setFormData({});
      setCurrentStep(0);
      localStorage.removeItem('surveyProgress');
      localStorage.removeItem('surveyStep');
    } catch (err) {
      setError('Failed to submit response. Please check your internet connection and try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewResponse = () => {
    setIsSubmitted(false);
    setFormData({});
    setCurrentStep(0);
    setShowWelcome(true);
  };

  const handleStartSurvey = () => {
    setShowWelcome(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStartSurvey} />;
  }

  if (isSubmitted) {
    return (
      <div className="survey-container">
        <div className="submission-success">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your response has been successfully recorded.</p>

          <div className="share-section">
            <p className="share-heading">Help us out -- share with your coursemates!</p>
            
            <div className="share-url-box">
              <span className="share-url">{surveyUrl}</span>
              <button className="copy-btn" onClick={handleCopyLink}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>

            <button className="btn whatsapp-btn" onClick={handleWhatsAppShare}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={handleNewResponse}>
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = surveyQuestions[currentStep];

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h1>Student Mobile Usage Survey for WiFi Installation</h1>
        <p className="subtitle">Legacy University Okija</p>
      </div>

      <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />

      <div className="question-wrapper">
        <QuestionCard
          question={currentQuestion.question}
          value={formData[currentQuestion.id]}
          onChange={(value) => handleChange(currentQuestion.id, value)}
          options={currentQuestion.options}
          type={currentQuestion.type}
          required={currentQuestion.required}
          placeholder={currentQuestion.placeholder}
          hasOtherField={currentQuestion.hasOtherField}
          otherValue={formData[currentQuestion.id + '_other']}
          onOtherChange={(value) => handleChange(currentQuestion.id + '_other', value)}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="navigation-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
        >
          ← Previous
        </button>
        
        {currentStep === totalSteps - 1 ? (
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : '✓ Submit'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext} disabled={isSubmitting}>
            Next →
          </button>
        )}
      </div>

      <div className="quick-tip">
        <span className="tip-icon">💡</span>
        <span>Tip: Answer quickly to finish in ~30 seconds!</span>
      </div>

    </div>
  );
};

export default SurveyForm;
