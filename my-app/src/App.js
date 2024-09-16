import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:5000/api/data'; // Update with your API URL
const FOLDERS_API_URL = 'http://127.0.0.1:5000/api/folders'; // API URL for fetching folders

function App() {
  
  const [folders, setFolders] = useState([]);
  const [displayDatasets, setDisplayDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // Fetch folders
  useEffect(() => {
    fetch(FOLDERS_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched folders:', data);
        setFolders(data);
      })
      .catch((error) => console.error('Error fetching folders', error));
  }, []);

  // Fetch datasets
  const fetchData = async (folderName) => {
    try {
      const response = await fetch(`${API_BASE_URL}?folder=${encodeURIComponent(folderName)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      console.log('Fetched datasets:', data);

      // Process the data if needed (e.g., mapping or transformation)
      const processedData = data.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        category: dataset.category,
        price: dataset.free === 'true' ? 'free' : dataset.price,
        rating: dataset.rating
      }));
      
      setDisplayDatasets(processedData);
      filterDatasets(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Filter datasets
  const filterDatasets = useCallback((datasetsToFilter) => {
    const filtered = datasetsToFilter.filter(dataset => {
      const matchesName = dataset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category ? dataset.category === category : true;

      const datasetPrice = dataset.price === 'free' ? 0 : parseFloat(dataset.price);
      const matchesPrice = dataset.price === 'free'
        ? minPrice <= 0 && maxPrice >= 0
        : !isNaN(datasetPrice) && datasetPrice >= minPrice && datasetPrice <= maxPrice;

      const matchesRating = isNaN(rating) ? true : dataset.rating === parseInt(rating);

      return matchesName && matchesCategory && matchesPrice && matchesRating;
    });
    setFilteredDatasets(filtered);
  }, [searchQuery, category, minPrice, maxPrice, rating]);

  useEffect(() => {
    if (displayDatasets.length > 0) {
      filterDatasets(displayDatasets);
    }
  }, [displayDatasets, filterDatasets]);

  const handleFolderClick = (folderName) => {
    setSelectedFolder(folderName);
    fetchData(folderName);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleDatasetClick = (dataset) => {
    setModalContent(dataset.sample);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-dark bg-warning mb-4">
        <a className="navbar-brand" href="#">Market Place Data</a>
      </nav>

      <div className="row">
        <div className="col-md-3 bg-light p-3">
          <form className="mb-3">
            <input
              className="form-control"
              type="search"
              placeholder="Search Providers"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
          </form>
          {folders.length === 0 ? (
            <p>No folders available</p>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id}
                className="btn btn-primary mb-2"
                onClick={() => handleFolderClick(folder.name)}
              >
                {folder.name}
              </button>
            ))
          )}
        </div>
        <div className="col-md-9">
          <section className="bg-light p-3 mb-4">
            <h2>Search and Filter Datasets</h2>
            <form className="form-inline">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <select
                    className="form-control"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">All Data Types</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="col-md-1 mb-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                </div>
                <div className="col-md-1 mb-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <select
                    className="form-control"
                    value={rating}
                    onChange={handleRatingChange}
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div className="col-md-12 text-right mt-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => filterDatasets(displayDatasets)}
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </section>

          { <section>
            <h2>Available Datasets</h2>
            <div className="row">
              {filteredDatasets.map(dataset => (
                <div key={dataset.id} className="col-md-4 mb-3">
                  <div className="dataset-item p-3 border rounded" onClick={() => handleDatasetClick(dataset)}>
                    <h4>{dataset.name}</h4>
                    <p>Category: {dataset.category}</p>
                    <p>Price: {dataset.price}</p>
                    <p>Rating: {dataset.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </section> }

          {/* Modal for Dataset Preview */}
          {<div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Dataset Preview</h5>
                  <button type="button" className="close" onClick={handleModalClose} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>{modalContent}</p>
                </div>
              </div>
            </div>
          </div>} 
        </div>
      </div>
    </div>
  );
}

export default App;

