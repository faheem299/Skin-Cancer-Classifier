import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Prediction failed');
    } finally {
      setLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  };

  return (
    <div className="App">
      <h1>Skin Cancer Classifier</h1>

      <h3 className="instructions">
        Benign: A benign tumor is a noncancerous abnormal mass of cells that grows slowly and remains localized without invading surrounding tissues or spreading to other parts of the body. Benign tumors usually have smooth, well-defined borders and do not pose a life-threatening risk unless they grow large enough to press on nearby organs or structures.
        <hr></hr>
        Malignant: A malignant tumor is cancerous, characterized by uncontrolled cell growth that can invade and destroy nearby tissues and spread (metastasize) to distant parts of the body through the bloodstream or lymphatic system. These tumors tend to grow rapidly, have irregular borders, and may recur after treatment.
        <hr></hr>
        Upload an image to know the type..
        <hr></hr>
      </h3>

      





      <form onSubmit={handleSubmit}>
        {/* Custom file input styling */}
        <div className="file-input-container">
          <label className="file-input-label">
            Choose Image
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input"
            />
          </label>
          <span className="file-name">
            {file ? file.name : 'No file chosen'}
          </span>
        </div>
        
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Processing...' : 'Analyze Image'}
        </button>
      </form>




      {file && (
        <div className="preview">
          <h3>Image Preview:</h3>
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      )}

      {prediction && (
        <div className="result">
          <h3>Result:</h3>
          <p>Class: <strong>{prediction.class}</strong></p>
          <p>Confidence: <strong>{(prediction.confidence * 100).toFixed(2)}%</strong></p>
        </div>
      )}
    </div>
  );
}

export default App;