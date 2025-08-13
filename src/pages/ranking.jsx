import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../Firebase";

export default function BrandRanking() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    const brandsRef = ref(database, "brands");

    const unsubscribe = onValue(brandsRef, (snapshot) => {
      const brandsData = snapshot.val();
      const brandsList = [];

      if (brandsData) {
        Object.keys(brandsData).forEach((key) => {
          const positionRank = Math.max(1, parseInt(brandsData[key].positionRank) || 0);
          brandsList.push({
            id: key,
            ...brandsData[key],
            positionRank,
          });
        });

        // Sort by positionRank
        brandsList.sort((a, b) => a.positionRank - b.positionRank);
        
        // Normalize ranks to ensure no gaps or duplicates
        brandsList.forEach((brand, index) => {
          brand.positionRank = index + 1;
        });
      }

      setBrands(brandsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.founderName &&
        brand.founderName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.positionRank - b.positionRank));

  const updateBrandRanks = async (updatedBrands) => {
    // Sort the brands by their new position ranks
    updatedBrands.sort((a, b) => a.positionRank - b.positionRank);
    
    // Normalize all ranks to be sequential
    updatedBrands.forEach((brand, index) => {
      brand.positionRank = index + 1;
    });

    setBrands(updatedBrands);
    
    // Update selected brand reference
    if (selectedBrand) {
      setSelectedBrand(updatedBrands.find(b => b.id === selectedBrand.id));
    }

    // Prepare updates for Firebase
    const updates = {};
    updatedBrands.forEach(brand => {
      updates[`brands/${brand.id}/positionRank`] = brand.positionRank;
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error("Error updating positionRanks:", error);
      // Optionally revert the UI changes if the update fails
      setBrands([...brands]);
    }
  };

  const moveBrand = async (direction) => {
    if (!selectedBrand) return;

    const currentIndex = brands.findIndex(b => b.id === selectedBrand.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < brands.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const updatedBrands = [...brands];
    
    // Swap positionRanks with the adjacent brand
    const tempRank = updatedBrands[currentIndex].positionRank;
    updatedBrands[currentIndex].positionRank = updatedBrands[newIndex].positionRank;
    updatedBrands[newIndex].positionRank = tempRank;

    await updateBrandRanks(updatedBrands);
  };

  const moveToTop = async () => {
    if (!selectedBrand) return;

    const currentIndex = brands.findIndex(b => b.id === selectedBrand.id);
    if (currentIndex === -1 || currentIndex === 0) return;

    const updatedBrands = [...brands];
    
    // Move selected brand to top by giving it rank 1
    updatedBrands[currentIndex].positionRank = 0;
    
    await updateBrandRanks(updatedBrands);
  };

  const moveToBottom = async () => {
    if (!selectedBrand) return;

    const currentIndex = brands.findIndex(b => b.id === selectedBrand.id);
    if (currentIndex === -1 || currentIndex === brands.length - 1) return;

    const updatedBrands = [...brands];
    
    // Move selected brand to bottom by giving it a high rank
    updatedBrands[currentIndex].positionRank = brands.length + 1;
    
    await updateBrandRanks(updatedBrands);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-400 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg text-blue-200">Loading brand rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Brand Ranking</h1>
              <p className="text-blue-300">Select a brand and use buttons to reorder</p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4">
          <label htmlFor="search" className="sr-only">Search brands</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pl-10 pr-3 py-2 bg-black bg-opacity-30 text-white placeholder-blue-400 rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search brands by name or founder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selectedBrand && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={moveToTop} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Move to Top
            </button>
            <button onClick={() => moveBrand('up')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Move Up
            </button>
            <button onClick={() => moveBrand('down')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Move Down
            </button>
            <button onClick={moveToBottom} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Move to Bottom
            </button>
            <button onClick={() => setSelectedBrand(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              Clear Selection
            </button>
          </div>
        )}

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg">
          {filteredBrands.length === 0 ? (
            <div className="px-6 py-4 text-center text-blue-300">
              No brands found matching your search
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={`flex items-center p-4 border-b border-blue-800 hover:bg-white hover:bg-opacity-10 transition-colors cursor-pointer ${
                  selectedBrand?.id === brand.id ? "bg-blue-900 bg-opacity-30" : ""
                }`}
              >
                <div className="flex-shrink-0 mr-4 text-white font-bold">
                  #{brand.positionRank}
                </div>
                {brand.logoUrl && (
                  <div className="flex-shrink-0 h-10 w-10 mr-4">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={brand.logoUrl}
                      alt={brand.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/40";
                      }}
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="text-white font-medium">{brand.name}</div>
                  <div className="text-blue-300 text-sm">
                    {brand.founderName && `Founder: ${brand.founderName}`}
                    {brand.foundedYear && ` • Est. ${brand.foundedYear}`}
                    {brand.headquarters && ` • HQ: ${brand.headquarters}`}
                  </div>
                  {brand.description && (
                    <div className="text-blue-200 text-xs mt-1 line-clamp-1">
                      {brand.description}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-blue-400">
                  {selectedBrand?.id === brand.id ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 bg-black bg-opacity-30 rounded-lg p-4 text-blue-300 text-sm">
          <p className="font-medium mb-2">How to reorder brands:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click on a brand to select it</li>
            <li>Use the buttons to move it up, down, to the top, or to the bottom</li>
            <li>Changes are saved automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}