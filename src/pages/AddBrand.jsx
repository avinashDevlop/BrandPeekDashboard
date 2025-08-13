import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
import { database } from "../Firebase";

export default function AddBrand() {
  const [brandData, setBrandData] = useState({
    name: "",
    logoUrl: "",
    description: "",
    website: "",
    founderName: "",
    foundedYear: "",
    headquarters: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setBrandData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBrandData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!brandData.name.trim()) newErrors.name = "Brand name is required";
    if (!brandData.logoUrl.trim()) newErrors.logoUrl = "Logo URL is required";
    else if (!/^https?:\/\/.+\..+/.test(brandData.logoUrl)) 
      newErrors.logoUrl = "Please enter a valid URL";
    if (!brandData.description.trim()) 
      newErrors.description = "Description is required";
    else if (brandData.description.length < 20) 
      newErrors.description = "Description should be at least 20 characters";
    if (brandData.website && !/^https?:\/\/.+\..+/.test(brandData.website))
      newErrors.website = "Please enter a valid website URL";
    if (!brandData.founderName.trim())
      newErrors.founderName = "Founder name is required";
    if (!brandData.foundedYear)
      newErrors.foundedYear = "Founded year is required";
    else if (isNaN(brandData.foundedYear))
      newErrors.foundedYear = "Please enter a valid year";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const brandsRef = ref(database, 'brands');
      const newBrandRef = push(brandsRef);
      await set(newBrandRef, {
        ...brandData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setSuccessMessage("Brand added successfully!");
      setBrandData({
        name: "",
        logoUrl: "",
        description: "",
        website: "",
        founderName: "",
        foundedYear: "",
        headquarters: "",
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
        },
      });
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error adding brand: ", error);
      setErrors({ submit: "Failed to add brand. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-black p-6">
            <h2 className="text-3xl font-bold text-white">Add New Brand</h2>
            <p className="text-blue-200">Fill in the details below to add a new brand to the database</p>
          </div>

          {/* Messages */}
          <div className="px-6 pt-4">
            {successMessage && (
              <div className="mb-4 p-4 bg-green-500 bg-opacity-20 text-green-100 rounded-lg border border-green-400">
                {successMessage}
              </div>
            )}
            
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-500 bg-opacity-20 text-red-100 rounded-lg border border-red-400">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={brandData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-blue-700'}`}
                  placeholder="Enter brand name"
                />
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
              </div>
              
              {/* Logo URL */}
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-blue-100 mb-2">
                  Logo URL *
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={brandData.logoUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.logoUrl ? 'border-red-500' : 'border-blue-700'}`}
                  placeholder="https://example.com/logo.png"
                />
                {errors.logoUrl && <p className="mt-2 text-sm text-red-400">{errors.logoUrl}</p>}
              </div>
              
              {/* Founder Name */}
              <div>
                <label htmlFor="founderName" className="block text-sm font-medium text-blue-100 mb-2">
                  Founder Name *
                </label>
                <input
                  type="text"
                  id="founderName"
                  name="founderName"
                  value={brandData.founderName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.founderName ? 'border-red-500' : 'border-blue-700'}`}
                  placeholder="Enter founder's name"
                />
                {errors.founderName && <p className="mt-2 text-sm text-red-400">{errors.founderName}</p>}
              </div>
              
              {/* Founded Year */}
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-blue-100 mb-2">
                  Founded Year *
                </label>
                <input
                  type="number"
                  id="foundedYear"
                  name="foundedYear"
                  value={brandData.foundedYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.foundedYear ? 'border-red-500' : 'border-blue-700'}`}
                  placeholder="e.g. 1994"
                />
                {errors.foundedYear && <p className="mt-2 text-sm text-red-400">{errors.foundedYear}</p>}
              </div>
              
              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-blue-100 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={brandData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.website ? 'border-red-500' : 'border-blue-700'}`}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="mt-2 text-sm text-red-400">{errors.website}</p>}
              </div>
              
              {/* Headquarters */}
              <div>
                <label htmlFor="headquarters" className="block text-sm font-medium text-blue-100 mb-2">
                  Headquarters
                </label>
                <input
                  type="text"
                  id="headquarters"
                  name="headquarters"
                  value={brandData.headquarters}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-blue-100 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={brandData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-3 bg-black bg-opacity-30 text-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-blue-700'}`}
                placeholder="Provide a detailed description of the brand"
              />
              {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
            </div>
            
            {/* Social Media Section */}
            <div className="border-t border-blue-800 pt-6">
              <h3 className="text-xl font-medium text-blue-100 mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-blue-100 mb-2">
                    Facebook
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-700 bg-blue-900 bg-opacity-50 text-blue-200">
                      fb.com/
                    </span>
                    <input
                      type="text"
                      id="facebook"
                      name="socialMedia.facebook"
                      value={brandData.socialMedia.facebook}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-md bg-black bg-opacity-30 text-white border-blue-700 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-blue-100 mb-2">
                    Instagram
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-700 bg-blue-900 bg-opacity-50 text-blue-200">
                      instagram.com/
                    </span>
                    <input
                      type="text"
                      id="instagram"
                      name="socialMedia.instagram"
                      value={brandData.socialMedia.instagram}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-md bg-black bg-opacity-30 text-white border-blue-700 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-blue-100 mb-2">
                    Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-700 bg-blue-900 bg-opacity-50 text-blue-200">
                      twitter.com/
                    </span>
                    <input
                      type="text"
                      id="twitter"
                      name="socialMedia.twitter"
                      value={brandData.socialMedia.twitter}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-md bg-black bg-opacity-30 text-white border-blue-700 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Brand...
                  </span>
                ) : (
                  "Add Brand"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}