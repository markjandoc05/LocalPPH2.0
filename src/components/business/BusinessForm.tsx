import React, { useState, useEffect } from 'react';
import { BusinessListing } from '@/types/business';
import { validateBusinessForm } from '@/lib/validation/business';
import MediaUploader from './MediaUploader';
import ImagePreviewCard from './ImagePreviewCard';
import DocumentUploadCard from './DocumentUploadCard';
import { 
  validateLogo, 
  validateCover, 
  validateDocument 
} from '@/lib/validation/media';
import { 
  uploadBusinessLogo, 
  uploadBusinessCover, 
  uploadBusinessGalleryImage,
  uploadBusinessDocument,
  deleteBusinessMedia 
} from '@/lib/firebase/storage';
import { auth } from '@/lib/firebase/config';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import {
  getAllCategories,
  getAllRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getSubcategoriesByCategory
} from '@/lib/data-connect/directory-service';

interface BusinessFormProps {
  initialData?: Partial<BusinessListing>;
  onSubmit: (data: Partial<BusinessListing>, action: 'save' | 'submit') => Promise<void>;
  isLoading: boolean;
}

export default function BusinessForm({ initialData = {}, onSubmit, isLoading }: BusinessFormProps) {
  const [formData, setFormData] = useState<Partial<BusinessListing>>({
    name: '',
    description: '',
    categoryId: '',
    regionId: '',
    provinceId: '',
    cityId: '',
    addressLine1: '',
    contactMobile: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Unique ID for uploads (either editing business ID or generated client-side)
  const [businessId] = useState(() => initialData.id || crypto.randomUUID());

  // Dynamic dropdown lists
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  // Split description state
  const [shortDescription, setShortDescription] = useState(() => {
    const desc = initialData.description || '';
    if (desc.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(desc);
        return parsed.short || parsed.description || desc;
      } catch (e) {
        return desc;
      }
    }
    return desc;
  });

  const [fullDescription, setFullDescription] = useState(() => {
    const desc = initialData.description || '';
    if (desc.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(desc);
        return parsed.full || parsed.description || desc;
      } catch (e) {
        return desc;
      }
    }
    return desc;
  });

  // Media State
  const [logoUrl, setLogoUrl] = useState<string | null>((initialData as any).logoUrl || null);
  const [logoProgress, setLogoProgress] = useState(0);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [coverUrl, setCoverUrl] = useState<string | null>((initialData as any).coverUrl || null);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<{ url: string; name: string; id: string; path?: string }[]>((initialData as any).documents || []);

  const [gallery, setGallery] = useState<string[]>((initialData as any).gallery || []);
  const [galleryProgress, setGalleryProgress] = useState<{ [filename: string]: number }>({});
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Fetch Categories & Regions on Mount
  useEffect(() => {
    let active = true;
    const loadInitialMetadata = async () => {
      try {
        const [cats, regs] = await Promise.all([
          getAllCategories(),
          getAllRegions()
        ]);
        if (active) {
          setCategoriesList(cats);
          setRegionsList(regs);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadInitialMetadata();
    return () => { active = false; };
  }, []);

  // Fetch Provinces when regionId changes
  useEffect(() => {
    let active = true;
    const loadProvinces = async () => {
      if (!formData.regionId) {
        await Promise.resolve();
        if (active) {
          setProvincesList([]);
          setCitiesList([]);
        }
        return;
      }
      try {
        const provs = await getProvincesByRegion(formData.regionId);
        if (active) {
          setProvincesList(provs);
        }
      } catch (err) {
        console.error('Error loading provinces:', err);
      }
    };
    loadProvinces();
    return () => { active = false; };
  }, [formData.regionId]);

  // Fetch Subcategories when categoryId changes
  useEffect(() => {
    let active = true;
    const loadSubcategories = async () => {
      if (!formData.categoryId) {
        if (active) {
          setSubcategoriesList([]);
        }
        return;
      }
      try {
        const subs = await getSubcategoriesByCategory(formData.categoryId);
        if (active) {
          setSubcategoriesList(subs);
        }
      } catch (err) {
        console.error('Error loading subcategories:', err);
      }
    };
    loadSubcategories();
    return () => { active = false; };
  }, [formData.categoryId]);

  // Fetch Cities when provinceId changes
  useEffect(() => {
    let active = true;
    const loadCities = async () => {
      if (!formData.provinceId) {
        await Promise.resolve();
        if (active) {
          setCitiesList([]);
        }
        return;
      }
      try {
        const cts = await getCitiesByProvince(formData.provinceId);
        if (active) {
          setCitiesList(cts);
        }
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    loadCities();
    return () => { active = false; };
  }, [formData.provinceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Cascade resets
      if (name === 'regionId') {
        updated.provinceId = '';
        updated.cityId = '';
      } else if (name === 'provinceId') {
        updated.cityId = '';
      } else if (name === 'categoryId') {
        updated.subcategoryId = '';
      }
      return updated;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }));
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!auth.currentUser) {
      setLogoError('You must be logged in to upload files');
      return;
    }
    const error = validateLogo(file);
    if (error) { setLogoError(error); return; }
    setLogoError(null);
    setIsLogoUploading(true);
    setLogoProgress(0);
    try {
      const result = await uploadBusinessLogo(file, businessId, (p) => {
        setLogoProgress(Math.round(p));
      });
      setLogoUrl(result.url);
    } catch (err: any) {
      setLogoError(err.message || 'Failed to upload logo');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!auth.currentUser) {
      setCoverError('You must be logged in to upload files');
      return;
    }
    const error = validateCover(file);
    if (error) { setCoverError(error); return; }
    setCoverError(null);
    setIsCoverUploading(true);
    setCoverProgress(0);
    try {
      const result = await uploadBusinessCover(file, businessId, (p) => {
        setCoverProgress(Math.round(p));
      });
      setCoverUrl(result.url);
    } catch (err: any) {
      setCoverError(err.message || 'Failed to upload cover image');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!auth.currentUser) {
      alert('You must be logged in to upload files');
      return;
    }
    const error = validateDocument(file);
    if (error) { alert(error); return; }
    try {
      const result = await uploadBusinessDocument(file, businessId);
      const newDoc = { url: result.url, name: file.name, id: Date.now().toString(), path: result.path };
      setDocuments(prev => [...prev, newDoc]);
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    }
  };

  const handleDocumentRemove = async (docId: string, path?: string) => {
    if (path) {
      try {
        await deleteBusinessMedia(path);
      } catch (err) {
        console.error('Error deleting document:', err);
      }
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleGalleryUpload = async (file: File) => {
    if (!auth.currentUser) {
      setGalleryError('You must be logged in to upload files');
      return;
    }
    const error = validateCover(file);
    if (error) { setGalleryError(error); return; }
    setGalleryError(null);
    setIsGalleryUploading(true);
    try {
      const result = await uploadBusinessGalleryImage(file, businessId, (p) => {
        setGalleryProgress(prev => ({ ...prev, [file.name]: Math.round(p) }));
      });
      setGallery(prev => [...prev, result.url]);
    } catch (err: any) {
      setGalleryError(err.message || 'Failed to upload gallery image');
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleGalleryRemove = async (url: string) => {
    try {
      const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      await deleteBusinessMedia(decodedPath);
    } catch (err) {
      console.error('Error deleting gallery image from storage:', err);
    }
    setGallery(prev => prev.filter(g => g !== url));
  };

  const handleSubmit = async (action: 'save' | 'submit') => {
    // Save descriptions serialized as JSON in the single description field of the schema
    const serializedDescription = JSON.stringify({
      short: shortDescription,
      full: fullDescription
    });

    // Pass the full description as the value to validateBusinessForm
    const dataToValidate = {
      ...formData,
      description: fullDescription
    };

    const formErrors = validateBusinessForm(dataToValidate);
    const customErrors: Record<string, string> = { ...formErrors };

    if (!shortDescription || shortDescription.trim() === '') {
      customErrors.shortDescription = 'Short description is required';
    }
    if (!fullDescription || fullDescription.trim() === '') {
      customErrors.fullDescription = 'Full description is required';
    }

    if (action === 'submit') {
      if (!logoUrl) {
        customErrors.logoUrl = 'Business logo is required';
      }
      if (documents.length === 0) {
        customErrors.documents = 'Business permit or verification document is required';
      }
    }

    if (Object.keys(customErrors).length > 0) {
      setErrors(customErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setErrors({});
    
    await onSubmit({ 
      ...formData, 
      id: businessId,
      description: serializedDescription,
      logoUrl: logoUrl || undefined,
      coverUrl: coverUrl || undefined,
      documents: documents,
      gallery: gallery
    }, action);
  };

  return (
    <div className="space-y-8">
      {/* Helper Notification Banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start gap-3">
        <div className="bg-blue-100 text-blue-700 rounded-full p-1 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Create / Edit Listing</h3>
          <p className="text-xs text-blue-700 mt-0.5">
            Submit your business for review. Once approved, it will appear in LocalPages.ph. You can also save your progress as a draft at any time.
          </p>
        </div>
      </div>

      {/* 1. Basic Information */}
      <Card className="border-slate-200 shadow-sm" id="section-basic">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-[#2563EB] w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h2>
        
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name || ''}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Juan's Coffee Shop"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-500 outline-none"
                placeholder="juans-coffee-shop"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">Auto-generated from business name. This will be your public URL (localpages.ph/biz/slug).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select 
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Category</option>
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory (Optional)</label>
                <select 
                  name="subcategoryId"
                  value={formData.subcategoryId || ''}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Select Subcategory</option>
                  {subcategoriesList.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description <span className="text-red-500">*</span></label>
              <textarea 
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  if (errors.shortDescription) {
                    setErrors(prev => { const n = { ...prev }; delete n.shortDescription; return n; });
                  }
                }}
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="A brief 1-2 sentence summary of your business to show in cards and lists."
              />
              {errors.shortDescription && <p className="mt-1 text-sm text-red-500">{errors.shortDescription}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description <span className="text-red-500">*</span></label>
              <textarea 
                name="fullDescription"
                value={fullDescription}
                onChange={(e) => {
                  setFullDescription(e.target.value);
                  if (errors.fullDescription) {
                    setErrors(prev => { const n = { ...prev }; delete n.fullDescription; return n; });
                  }
                }}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Detailed description of your history, team, values, specialties, and anything else you want customers to know."
              />
              {errors.fullDescription && <p className="mt-1 text-sm text-red-500">{errors.fullDescription}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Contact Information */}
      <Card className="border-slate-200 shadow-sm" id="section-contact">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-[#2563EB] w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Contact Information
          </h2>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input 
                type="tel" 
                name="contactMobile"
                value={formData.contactMobile || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.contactMobile ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. 0917 123 4567"
              />
              {errors.contactMobile && <p className="mt-1 text-sm text-red-500">{errors.contactMobile}</p>}
              <p className="mt-1 text-xs text-gray-400">At least mobile or landline number is required.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landline Telephone Number</label>
              <input 
                type="tel" 
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
                placeholder="e.g. (02) 8123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Email Address</label>
              <input 
                type="email" 
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
                placeholder="e.g. contact@juanscoffeeshop.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input 
                type="url" 
                name="websiteUrl"
                value={formData.websiteUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
                placeholder="e.g. https://www.juanscoffeeshop.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page URL</label>
              <input 
                type="url" 
                name="facebookUrl"
                value={formData.facebookUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
                placeholder="e.g. https://facebook.com/juanscoffeeshop"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Location */}
      <Card className="border-slate-200 shadow-sm" id="section-location">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-[#2563EB] w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Location
          </h2>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region <span className="text-red-500">*</span></label>
              <select 
                name="regionId"
                value={formData.regionId || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.regionId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Region</option>
                {regionsList.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.name}</option>
                ))}
              </select>
              {errors.regionId && <p className="mt-1 text-sm text-red-500">{errors.regionId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province <span className="text-red-500">*</span></label>
              <select 
                name="provinceId"
                value={formData.provinceId || ''}
                onChange={handleChange}
                disabled={!formData.regionId}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.provinceId ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}
              >
                <option value="">Select Province</option>
                {provincesList.map(prov => (
                  <option key={prov.id} value={prov.id}>{prov.name}</option>
                ))}
              </select>
              {errors.provinceId && <p className="mt-1 text-sm text-red-500">{errors.provinceId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City/Municipality <span className="text-red-500">*</span></label>
              <select 
                name="cityId"
                value={formData.cityId || ''}
                onChange={handleChange}
                disabled={!formData.provinceId}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.cityId ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}
              >
                <option value="">Select City</option>
                {citiesList.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              {errors.cityId && <p className="mt-1 text-sm text-red-500">{errors.cityId}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="addressLine1"
                value={formData.addressLine1 || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Unit 101, Ground Floor, XYZ Building, 123 Main St., Brgy. San Lorenzo"
              />
              {errors.addressLine1 && <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Logo & Permit */}
      <Card className="border-slate-200 shadow-sm" id="section-logo-permit">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-[#2563EB] w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Logo & Permit
          </h2>
        
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Business Logo <span className="text-red-500">*</span></h3>
              <div className="flex flex-col sm:flex-row gap-6">
                {logoUrl ? (
                  <ImagePreviewCard 
                    url={logoUrl} 
                    onRemove={() => { setLogoUrl(null); setFormData(prev => ({ ...prev, logoUrl: undefined })); }} 
                    isUploading={isLogoUploading}
                    progress={logoProgress}
                    className="w-32 h-32 flex-shrink-0"
                    objectFit="contain"
                  />
                ) : (
                  <div className="w-full sm:w-64">
                    <MediaUploader 
                      onFileSelect={handleLogoUpload}
                      accept="image/jpeg, image/png, image/webp"
                      label="Upload Logo"
                      helperText="JPG, PNG, WEBP. Max 2MB. Square format recommended."
                      isUploading={isLogoUploading}
                    />
                  </div>
                )}
              </div>
              {errors.logoUrl && <p className="mt-2 text-sm text-red-500 font-medium">{errors.logoUrl}</p>}
              {logoError && <p className="mt-2 text-sm text-red-500">{logoError}</p>}
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Verification Document / Business Permit <span className="text-red-500">*</span></h3>
              <div className="space-y-4">
                <div className="w-full max-w-2xl">
                  <MediaUploader 
                    onFileSelect={handleDocumentUpload}
                    accept="application/pdf, image/jpeg, image/png"
                    label="Upload Document"
                    helperText="Upload DTI/SEC registration, Mayor's Permit, or BIR Form 2303. PDF, JPG, PNG. Max 10MB."
                    type="document"
                  />
                </div>
                
                {documents.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    {documents.map((doc) => (
                      <DocumentUploadCard 
                        key={doc.id}
                        fileName={doc.name}
                        onRemove={() => handleDocumentRemove(doc.id, doc.path)}
                      />
                    ))}
                  </div>
                )}
              </div>
              {errors.documents && <p className="mt-2 text-sm text-red-500 font-medium">{errors.documents}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-12 flex items-center justify-end gap-4 z-10 rounded-t-xl">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('save')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit('submit')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}

