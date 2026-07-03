import React, { useState } from 'react';
import { BusinessListing } from '@/types/business';
import { validateBusinessForm } from '@/lib/validation/business';
import MediaUploader from './MediaUploader';
import ImagePreviewCard from './ImagePreviewCard';
import DocumentUploadCard from './DocumentUploadCard';
import { 
  validateLogo, 
  validateCover, 
  validateGalleryImage, 
  validateDocument 
} from '@/lib/validation/media';
import { 
  uploadBusinessLogo, 
  uploadBusinessCover, 
  uploadBusinessGalleryImage, 
  uploadBusinessDocument,
  deleteBusinessMedia 
} from '@/lib/firebase/storage';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

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
  
  // Media State Placeholders (since they aren't part of BusinessListing yet in full detail)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [gallery, setGallery] = useState<{ url: string; id: string }[]>([]);
  const [documents, setDocuments] = useState<{ url: string; name: string; id: string }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (action: 'save' | 'submit') => {
    const formErrors = validateBusinessForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    await onSubmit(formData, action);
  };

  return (
    <div className="space-y-8">
      {/* 1. Basic Information */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">1. Basic Information</h2>
        
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea 
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe your business, what you do, and what makes you unique."
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
                <option value="c1">Food & Beverage</option>
                <option value="c2">IT Services</option>
                <option value="c3">Retail</option>
                {/* Mock options */}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input 
                type="text" 
                name="keywords"
                value={formData.keywords || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
                placeholder="coffee, cafe, espresso, pastries (comma separated)"
              />
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* 2. Contact Information */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">2. Contact Information</h2>
        
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landline Phone</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Public Email</label>
            <input 
              type="email" 
              name="contactEmail"
              value={formData.contactEmail || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
              placeholder="hello@example.com"
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
              placeholder="https://www.example.com"
            />
          </div>
        </div>
        </CardContent>
      </Card>

      {/* 3. Location */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">3. Location</h2>
        
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
              <option value="r1">NCR</option>
              <option value="r2">Region IV-A</option>
            </select>
            {errors.regionId && <p className="mt-1 text-sm text-red-500">{errors.regionId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province <span className="text-red-500">*</span></label>
            <select 
              name="provinceId"
              value={formData.provinceId || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.provinceId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Province</option>
              <option value="p1">Metro Manila</option>
              <option value="p2">Cavite</option>
            </select>
            {errors.provinceId && <p className="mt-1 text-sm text-red-500">{errors.provinceId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City/Municipality <span className="text-red-500">*</span></label>
            <select 
              name="cityId"
              value={formData.cityId || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white ${errors.cityId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select City</option>
              <option value="city1">Manila</option>
              <option value="city2">Makati</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
            <input 
              type="url" 
              name="googleMapsUrl"
              value={formData.googleMapsUrl || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none"
              placeholder="https://goo.gl/maps/..."
            />
          </div>
        </div>
        </CardContent>
      </Card>

      {/* 4. Media */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">4. Media & Documents</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Business Logo</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              {logoUrl ? (
                <ImagePreviewCard 
                  url={logoUrl} 
                  onRemove={() => setLogoUrl(null)} 
                  isUploading={isLogoUploading}
                  progress={logoProgress}
                  className="w-32 h-32 flex-shrink-0"
                />
              ) : (
                <div className="w-full sm:w-64">
                  <MediaUploader 
                    onFileSelect={(file) => {
                      const error = validateLogo(file);
                      if (error) { setLogoError(error); return; }
                      setLogoError(null);
                      // Placeholder for actual upload
                      console.log('Would upload logo:', file);
                      // Simulated upload for UI
                      setIsLogoUploading(true);
                      setTimeout(() => { setIsLogoUploading(false); setLogoUrl(URL.createObjectURL(file)); }, 1000);
                    }}
                    accept="image/jpeg, image/png, image/webp"
                    label="Upload Logo"
                    helperText="JPG, PNG, WEBP. Max 2MB. Square format recommended."
                    isUploading={isLogoUploading}
                  />
                </div>
              )}
            </div>
            {logoError && <p className="mt-2 text-sm text-red-500">{logoError}</p>}
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Cover Image</h3>
            <div className="flex flex-col gap-6">
              {coverUrl ? (
                <ImagePreviewCard 
                  url={coverUrl} 
                  onRemove={() => setCoverUrl(null)} 
                  isUploading={isCoverUploading}
                  progress={coverProgress}
                  className="w-full max-w-2xl h-48"
                  aspectRatio="video"
                />
              ) : (
                <div className="w-full max-w-2xl">
                  <MediaUploader 
                    onFileSelect={(file) => {
                      const error = validateCover(file);
                      if (error) { setCoverError(error); return; }
                      setCoverError(null);
                      // Simulated upload
                      setIsCoverUploading(true);
                      setTimeout(() => { setIsCoverUploading(false); setCoverUrl(URL.createObjectURL(file)); }, 1000);
                    }}
                    accept="image/jpeg, image/png, image/webp"
                    label="Upload Cover Image"
                    helperText="JPG, PNG, WEBP. Max 5MB. 16:9 ratio recommended."
                    isUploading={isCoverUploading}
                  />
                </div>
              )}
            </div>
            {coverError && <p className="mt-2 text-sm text-red-500">{coverError}</p>}
          </div>
          
          <hr className="border-gray-200" />

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Verification Documents</h3>
            <div className="space-y-4">
              <div className="w-full max-w-2xl">
                <MediaUploader 
                  onFileSelect={(file) => {
                    const error = validateDocument(file);
                    if (error) { alert(error); return; }
                    // Simulated upload
                    const newDoc = { url: URL.createObjectURL(file), name: file.name, id: Date.now().toString() };
                    setDocuments(prev => [...prev, newDoc]);
                  }}
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
                      onRemove={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                    />
                  ))}
                </div>
              )}
            </div>
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
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit('submit')}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </div>
    </div>
  );
}
