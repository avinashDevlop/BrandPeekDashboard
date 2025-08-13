import React, { useEffect, useState, useMemo } from "react";
import { ref, onValue, off, query, orderByChild, update } from "firebase/database";
import { database } from "../Firebase";
import { Link } from "react-router-dom";

export default function BrandView() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "positionRank",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Ranking algorithm with weights
  const calculateRank = (brand) => {
    let rank = 0;

    // Establishment (years since founding)
    if (brand.foundedYear) {
      const yearsEstablished = new Date().getFullYear() - parseInt(brand.foundedYear);
      rank += yearsEstablished * 2; // 2 points per year
    }

    // Completeness of profile
    if (brand.description && brand.description.length > 50) rank += 10;
    if (brand.logoUrl) rank += 5;
    if (brand.website) rank += 5;
    if (brand.headquarters) rank += 3;
    if (brand.founderName) rank += 3;

    // Social presence
    if (brand.socialMedia) {
      if (brand.socialMedia.facebook) rank += 2;
      if (brand.socialMedia.instagram) rank += 3; // Instagram gets more weight
      if (brand.socialMedia.twitter) rank += 2;
      if (brand.socialMedia.linkedin) rank += 1;
    }

    return Math.max(0, rank); // Ensure rank is never negative
  };

  useEffect(() => {
    const brandsRef = query(ref(database, "brands"), orderByChild("name"));

    const fetchData = onValue(brandsRef, (snapshot) => {
      const brandsData = snapshot.val();
      let brandsList = [];

      if (brandsData) {
        // Step 1: Build list with calculated weighted rank
        Object.keys(brandsData).forEach((key) => {
          const brand = brandsData[key];
          const calculatedRank = calculateRank(brand);
          brandsList.push({
            id: key,
            ...brand,
            calculatedRank,
          });
        });

        // Step 2: Sort by calculatedRank descending
        brandsList.sort((a, b) => b.calculatedRank - a.calculatedRank);

        // Step 3: Assign positionRank (1, 2, 3, ...)
        brandsList = brandsList.map((brand, index) => ({
          ...brand,
          positionRank: index + 1,
        }));

        // Step 4: Update Firebase if rank or positionRank differ to reduce writes
        brandsList.forEach((brand) => {
          const needUpdateRank = brand.rank !== brand.calculatedRank;
        //   const needUpdatePosition = brand.positionRank !== brand.positionRank; // This will always be false, fix below

          // Fix for needUpdatePosition: check stored positionRank in DB
          // Since we don't have brand.positionRank from DB separately, skip this check or update unconditionally
          // To avoid updates on every fetch, better to read existing positionRank and compare, but for simplicity, updating anyway here
          if (needUpdateRank || true) {
            const brandRef = ref(database, `brands/${brand.id}`);
            update(brandRef, {
              rank: brand.calculatedRank,
              positionRank: brand.positionRank,
            }).catch((error) =>
              console.error("Error updating brand rank:", error)
            );
          }
        });
      }

      // Set state for rendering
      setBrands(
        brandsList.map((brand) => ({
          id: brand.id,
          ...brand,
          rank: brand.calculatedRank,
          positionRank: brand.positionRank,
        }))
      );
      setLoading(false);
    });

    return () => off(brandsRef, "value", fetchData);
  }, []);

  // Sort brands according to user selected sort config
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Memoized sorted and filtered brands
  const sortedBrands = useMemo(() => {
    let sortableBrands = [...brands];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableBrands = sortableBrands.filter(
        (brand) =>
          brand.name.toLowerCase().includes(term) ||
          (brand.description && brand.description.toLowerCase().includes(term)) ||
          (brand.founderName && brand.founderName.toLowerCase().includes(term)) ||
          (brand.headquarters && brand.headquarters.toLowerCase().includes(term))
      );
    }

    // Sort by selected key
    if (sortConfig.key) {
      sortableBrands.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? 0;
        const bValue = b[sortConfig.key] ?? 0;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableBrands;
  }, [brands, sortConfig, searchTerm]);

  // Visual styling based on weighted rank (score)
  const getRankColor = (rank) => {
    if (rank > 50) return "from-purple-600 to-blue-800";
    if (rank > 30) return "from-blue-600 to-blue-900";
    if (rank > 15) return "from-blue-700 to-indigo-900";
    return "from-gray-700 to-gray-900";
  };

  // Badge by discrete position rank
  const getRankBadge = (positionRank) => {
    if (positionRank === 1) return "🥇 1st";
    if (positionRank === 2) return "🥈 2nd";
    if (positionRank === 3) return "🥉 3rd";
    if (positionRank <= 10) return `Top ${positionRank}`;
    return `${positionRank}th Place`;
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
          <p className="mt-4 text-lg text-blue-200">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Brand Directory</h1>
          <p className="text-blue-300 max-w-2xl mx-auto">
            Discover and explore brands ranked by their establishment, profile
            completeness, and online presence.
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-1/2">
              <label htmlFor="search" className="sr-only">
                Search brands
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-3 bg-black bg-opacity-30 text-white placeholder-blue-400 rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search brands by name, description, founder or HQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-200">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => requestSort("positionRank")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    sortConfig.key === "positionRank"
                      ? "bg-blue-800 text-white"
                      : "bg-black bg-opacity-30 text-blue-200 hover:bg-blue-900"
                  }`}
                >
                  Rank{" "}
                  {sortConfig.key === "positionRank" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => requestSort("name")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    sortConfig.key === "name"
                      ? "bg-blue-800 text-white"
                      : "bg-black bg-opacity-30 text-blue-200 hover:bg-blue-900"
                  }`}
                >
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => requestSort("foundedYear")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    sortConfig.key === "foundedYear"
                      ? "bg-blue-800 text-white"
                      : "bg-black bg-opacity-30 text-blue-200 hover:bg-blue-900"
                  }`}
                >
                  Year{" "}
                  {sortConfig.key === "foundedYear" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        {sortedBrands.length === 0 ? (
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-white">No brands found</h3>
            <p className="mt-1 text-blue-200">
              {searchTerm ? "Try a different search term" : "The brand directory is currently empty"}
            </p>
            <div className="mt-6">
              <Link
                to="/add-brand"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New Brand
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white bg-opacity-5 hover:bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
              >
                {/* Brand Header with Rank */}
                <div className={`bg-gradient-to-r ${getRankColor(brand.rank || 0)} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black bg-opacity-30 text-white">
                        {getRankBadge(brand.positionRank)}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                        Score: {brand.rank || 0}
                      </span>
                    </div>
                    {brand.foundedYear && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black bg-opacity-30 text-blue-200">
                        Est. {brand.foundedYear}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-white truncate">{brand.name}</h2>
                </div>

                {/* Brand Content */}
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    {brand.logoUrl ? (
                      <img
                        className="h-16 w-16 rounded-lg object-contain bg-black bg-opacity-30 border border-blue-800"
                        src={brand.logoUrl}
                        alt={`${brand.name} logo`}
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none' stroke='%231e40af' stroke-width='2'%3E%3Crect width='64' height='64' rx='8' fill='%23000' fill-opacity='0.2'/%3E%3Ctext x='32' y='35' font-family='Arial' font-size='14' text-anchor='middle' fill='%231e40af'%3E%3Ctspan%3ENo%3C/tspan%3E%3Ctspan x='32' y='50'%3ELogo%3C/tspan%3E%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-black bg-opacity-30 border border-blue-800 flex items-center justify-center text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="ml-4">
                      {brand.founderName && (
                        <p className="text-sm text-blue-300">
                          <span className="font-medium">Founder:</span> {brand.founderName}
                        </p>
                      )}
                      {brand.headquarters && (
                        <p className="text-sm text-blue-300 mt-1">
                          <span className="font-medium">HQ:</span> {brand.headquarters}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-blue-100 text-sm line-clamp-3 mb-4">
                    {brand.description || "No description provided."}
                  </p>

                  {/* Social Media Links */}
                  {(brand.socialMedia || brand.website) && (
                    <div className="mt-4 pt-4 border-t border-blue-800">
                      <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        Connect
                      </h4>
                      <div className="flex space-x-3">
                        {brand.socialMedia?.facebook && (
                          <a
                            href={`https://facebook.com/${brand.socialMedia.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-white transition-colors"
                            title="Facebook"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path
                                fillRule="evenodd"
                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                        {brand.socialMedia?.instagram && (
                          <a
                            href={`https://instagram.com/${brand.socialMedia.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-white transition-colors"
                            title="Instagram"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path
                                fillRule="evenodd"
                                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                        {brand.socialMedia?.twitter && (
                          <a
                            href={`https://twitter.com/${brand.socialMedia.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-white transition-colors"
                            title="Twitter"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                          </a>
                        )}
                        {brand.website && (
                          <a
                            href={
                              brand.website.startsWith("http")
                                ? brand.website
                                : `https://${brand.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-white transition-colors"
                            title="Website"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path
                                fillRule="evenodd"
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
