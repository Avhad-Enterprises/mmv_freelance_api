# CMS API - Frontend Integration Guide

> **For:** Frontend React/TypeScript Developers  
> **Purpose:** Integrate CMS APIs into Admin Panel  
> **Last Updated:** December 24, 2025  
> **Status:** ✅ Ready for Integration

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [API Setup](#-api-setup)
3. [TypeScript Types](#-typescript-types)
4. [Admin Panel Integration](#-admin-panel-integration)
5. [Component Examples](#-component-examples)
6. [State Management](#-state-management)
7. [Error Handling](#-error-handling)
8. [Best Practices](#-best-practices)

---

## 🚀 Quick Start

### What You Need

- ✅ Backend API running on `http://localhost:8000`
- ✅ Admin authentication (JWT token)
- ✅ Admin role (SUPER_ADMIN or ADMIN)

### Overview

The CMS API provides 42 endpoints to manage 6 landing page sections:

1. **Hero Section** - Main banner with CTA
2. **Trusted Companies** - Client logos
3. **Why Choose Us** - Feature highlights
4. **Featured Creators** - Showcase profiles
5. **Success Stories** - Client testimonials
6. **Landing FAQs** - Q&A section

Each section has:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Drag-and-drop reordering
- ✅ Visibility toggle (active/inactive)
- ✅ Soft delete (recoverable)

---

## 🔧 API Setup

### Step 1: Create API Utility File

Create `src/utils/api.ts` (or update existing):

```typescript
// src/utils/api.ts
import axios, { AxiosInstance } from 'axios';

// Base configuration
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your state management
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data, // Return only data
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📐 TypeScript Types

### Step 2: Define TypeScript Interfaces

Create `src/types/cms.types.ts`:

```typescript
// src/types/cms.types.ts

// Base interface for all CMS items
export interface BaseCMSItem {
  id: number;
  sort_order: number;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  deleted_by?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Hero Section
export interface HeroSection extends BaseCMSItem {
  title: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  hero_image?: string;
  background_image?: string;
}

export interface CreateHeroDTO {
  title: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  hero_image?: string;
  background_image?: string;
  is_active?: boolean;
}

export interface UpdateHeroDTO extends Partial<CreateHeroDTO> {
  id: number;
}

// Trusted Company
export interface TrustedCompany extends BaseCMSItem {
  company_name: string;
  logo_url: string;
  website_url?: string;
}

export interface CreateTrustedCompanyDTO {
  company_name: string;
  logo_url: string;
  website_url?: string;
  is_active?: boolean;
}

export interface UpdateTrustedCompanyDTO extends Partial<CreateTrustedCompanyDTO> {
  id: number;
}

// Why Choose Us
export interface WhyChooseUsItem extends BaseCMSItem {
  title: string;
  description?: string;
  icon_url?: string;
  icon_class?: string;
}

export interface CreateWhyChooseUsDTO {
  title: string;
  description?: string;
  icon_url?: string;
  icon_class?: string;
  is_active?: boolean;
}

export interface UpdateWhyChooseUsDTO extends Partial<CreateWhyChooseUsDTO> {
  id: number;
}

// Featured Creator
export interface FeaturedCreator extends BaseCMSItem {
  creator_name: string;
  creator_title?: string;
  creator_image_url?: string;
  creator_bio?: string;
  portfolio_url?: string;
  specialization?: string;
  years_experience?: number;
}

export interface CreateFeaturedCreatorDTO {
  creator_name: string;
  creator_title?: string;
  creator_image_url?: string;
  creator_bio?: string;
  portfolio_url?: string;
  specialization?: string;
  years_experience?: number;
  is_active?: boolean;
}

export interface UpdateFeaturedCreatorDTO extends Partial<CreateFeaturedCreatorDTO> {
  id: number;
}

// Success Story
export interface SuccessStory extends BaseCMSItem {
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_image_url?: string;
  testimonial: string;
  rating?: number;
  project_description?: string;
  video_url?: string;
}

export interface CreateSuccessStoryDTO {
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_image_url?: string;
  testimonial: string;
  rating?: number;
  project_description?: string;
  video_url?: string;
  is_active?: boolean;
}

export interface UpdateSuccessStoryDTO extends Partial<CreateSuccessStoryDTO> {
  id: number;
}

// Landing FAQ
export interface LandingFAQ extends BaseCMSItem {
  question: string;
  answer: string;
  category?: string;
}

export interface CreateLandingFAQDTO {
  question: string;
  answer: string;
  category?: string;
  is_active?: boolean;
}

export interface UpdateLandingFAQDTO extends Partial<CreateLandingFAQDTO> {
  id: number;
}

// Reorder DTO (used for all sections)
export interface ReorderItemDTO {
  id: number;
  sort_order: number;
}

export interface BulkReorderDTO {
  items: ReorderItemDTO[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface APIError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## 🔌 Admin Panel Integration

### Step 3: Create CMS API Service

Create `src/services/cmsService.ts`:

```typescript
// src/services/cmsService.ts
import apiClient from '../utils/api';
import {
  HeroSection,
  CreateHeroDTO,
  UpdateHeroDTO,
  TrustedCompany,
  CreateTrustedCompanyDTO,
  UpdateTrustedCompanyDTO,
  WhyChooseUsItem,
  CreateWhyChooseUsDTO,
  UpdateWhyChooseUsDTO,
  FeaturedCreator,
  CreateFeaturedCreatorDTO,
  UpdateFeaturedCreatorDTO,
  SuccessStory,
  CreateSuccessStoryDTO,
  UpdateSuccessStoryDTO,
  LandingFAQ,
  CreateLandingFAQDTO,
  UpdateLandingFAQDTO,
  BulkReorderDTO,
  APIResponse,
} from '../types/cms.types';

const CMS_BASE = '/cms-landing';

// ===========================================
// HERO SECTION APIs
// ===========================================

export const cmsHeroAPI = {
  // Get all hero sections (including inactive)
  getAll: () => 
    apiClient.get<APIResponse<HeroSection[]>>(`${CMS_BASE}/hero`),

  // Get hero section by ID
  getById: (id: number) => 
    apiClient.get<APIResponse<HeroSection>>(`${CMS_BASE}/hero/${id}`),

  // Create new hero section
  create: (data: CreateHeroDTO) => 
    apiClient.post<APIResponse<HeroSection>>(`${CMS_BASE}/hero`, data),

  // Update hero section
  update: (data: UpdateHeroDTO) => 
    apiClient.put<APIResponse<HeroSection>>(`${CMS_BASE}/hero`, data),

  // Delete hero section (soft delete)
  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/hero/${id}`),
};

// ===========================================
// TRUSTED COMPANIES APIs
// ===========================================

export const cmsTrustedCompaniesAPI = {
  getAll: () => 
    apiClient.get<APIResponse<TrustedCompany[]>>(`${CMS_BASE}/trusted-companies`),

  getById: (id: number) => 
    apiClient.get<APIResponse<TrustedCompany>>(`${CMS_BASE}/trusted-companies/${id}`),

  create: (data: CreateTrustedCompanyDTO) => 
    apiClient.post<APIResponse<TrustedCompany>>(`${CMS_BASE}/trusted-companies`, data),

  update: (data: UpdateTrustedCompanyDTO) => 
    apiClient.put<APIResponse<TrustedCompany>>(`${CMS_BASE}/trusted-companies`, data),

  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/trusted-companies/${id}`),

  // Reorder companies (for drag-and-drop)
  reorder: (data: BulkReorderDTO) => 
    apiClient.put<APIResponse<{ message: string; count: number }>>(`${CMS_BASE}/trusted-companies/reorder`, data),
};

// ===========================================
// WHY CHOOSE US APIs
// ===========================================

export const cmsWhyChooseUsAPI = {
  getAll: () => 
    apiClient.get<APIResponse<WhyChooseUsItem[]>>(`${CMS_BASE}/why-choose-us`),

  getById: (id: number) => 
    apiClient.get<APIResponse<WhyChooseUsItem>>(`${CMS_BASE}/why-choose-us/${id}`),

  create: (data: CreateWhyChooseUsDTO) => 
    apiClient.post<APIResponse<WhyChooseUsItem>>(`${CMS_BASE}/why-choose-us`, data),

  update: (data: UpdateWhyChooseUsDTO) => 
    apiClient.put<APIResponse<WhyChooseUsItem>>(`${CMS_BASE}/why-choose-us`, data),

  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/why-choose-us/${id}`),

  reorder: (data: BulkReorderDTO) => 
    apiClient.put<APIResponse<{ message: string; count: number }>>(`${CMS_BASE}/why-choose-us/reorder`, data),
};

// ===========================================
// FEATURED CREATORS APIs
// ===========================================

export const cmsFeaturedCreatorsAPI = {
  getAll: () => 
    apiClient.get<APIResponse<FeaturedCreator[]>>(`${CMS_BASE}/featured-creators`),

  getById: (id: number) => 
    apiClient.get<APIResponse<FeaturedCreator>>(`${CMS_BASE}/featured-creators/${id}`),

  create: (data: CreateFeaturedCreatorDTO) => 
    apiClient.post<APIResponse<FeaturedCreator>>(`${CMS_BASE}/featured-creators`, data),

  update: (data: UpdateFeaturedCreatorDTO) => 
    apiClient.put<APIResponse<FeaturedCreator>>(`${CMS_BASE}/featured-creators`, data),

  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/featured-creators/${id}`),

  reorder: (data: BulkReorderDTO) => 
    apiClient.put<APIResponse<{ message: string; count: number }>>(`${CMS_BASE}/featured-creators/reorder`, data),
};

// ===========================================
// SUCCESS STORIES APIs
// ===========================================

export const cmsSuccessStoriesAPI = {
  getAll: () => 
    apiClient.get<APIResponse<SuccessStory[]>>(`${CMS_BASE}/success-stories`),

  getById: (id: number) => 
    apiClient.get<APIResponse<SuccessStory>>(`${CMS_BASE}/success-stories/${id}`),

  create: (data: CreateSuccessStoryDTO) => 
    apiClient.post<APIResponse<SuccessStory>>(`${CMS_BASE}/success-stories`, data),

  update: (data: UpdateSuccessStoryDTO) => 
    apiClient.put<APIResponse<SuccessStory>>(`${CMS_BASE}/success-stories`, data),

  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/success-stories/${id}`),

  reorder: (data: BulkReorderDTO) => 
    apiClient.put<APIResponse<{ message: string; count: number }>>(`${CMS_BASE}/success-stories/reorder`, data),
};

// ===========================================
// LANDING FAQs APIs
// ===========================================

export const cmsLandingFAQsAPI = {
  getAll: () => 
    apiClient.get<APIResponse<LandingFAQ[]>>(`${CMS_BASE}/faqs`),

  getById: (id: number) => 
    apiClient.get<APIResponse<LandingFAQ>>(`${CMS_BASE}/faqs/${id}`),

  create: (data: CreateLandingFAQDTO) => 
    apiClient.post<APIResponse<LandingFAQ>>(`${CMS_BASE}/faqs`, data),

  update: (data: UpdateLandingFAQDTO) => 
    apiClient.put<APIResponse<LandingFAQ>>(`${CMS_BASE}/faqs`, data),

  delete: (id: number) => 
    apiClient.delete<APIResponse<{ message: string }>>(`${CMS_BASE}/faqs/${id}`),

  reorder: (data: BulkReorderDTO) => 
    apiClient.put<APIResponse<{ message: string; count: number }>>(`${CMS_BASE}/faqs/reorder`, data),
};

// Export all APIs as a single object (optional)
export const cmsAPI = {
  hero: cmsHeroAPI,
  trustedCompanies: cmsTrustedCompaniesAPI,
  whyChooseUs: cmsWhyChooseUsAPI,
  featuredCreators: cmsFeaturedCreatorsAPI,
  successStories: cmsSuccessStoriesAPI,
  faqs: cmsLandingFAQsAPI,
};
```

---

## 🎨 Component Examples

### Step 4: Create Admin Panel Components

#### Example 1: Hero Section Management Component

```tsx
// src/container/CMS/HeroSection.tsx
import React, { useState, useEffect } from 'react';
import { cmsHeroAPI } from '../../services/cmsService';
import { HeroSection, CreateHeroDTO } from '../../types/cms.types';

const HeroSectionManager: React.FC = () => {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateHeroDTO>({
    title: '',
    subtitle: '',
    description: '',
    primary_button_text: 'Get Started',
    primary_button_link: '/signup',
    is_active: true,
  });

  // Fetch all hero sections on mount
  useEffect(() => {
    fetchHeroSections();
  }, []);

  const fetchHeroSections = async () => {
    try {
      setLoading(true);
      const response = await cmsHeroAPI.getAll();
      setHeroSections(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hero sections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cmsHeroAPI.create(formData);
      await fetchHeroSections(); // Refresh list
      resetForm();
      alert('Hero section created successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create hero section');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await cmsHeroAPI.update({ id: editingId, ...formData });
      await fetchHeroSections();
      resetForm();
      alert('Hero section updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hero section');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this hero section?')) return;

    try {
      await cmsHeroAPI.delete(id);
      await fetchHeroSections();
      alert('Hero section deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hero section');
    }
  };

  const handleEdit = (hero: HeroSection) => {
    setEditingId(hero.id);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      description: hero.description || '',
      primary_button_text: hero.primary_button_text || '',
      primary_button_link: hero.primary_button_link || '',
      secondary_button_text: hero.secondary_button_text || '',
      secondary_button_link: hero.secondary_button_link || '',
      hero_image: hero.hero_image || '',
      background_image: hero.background_image || '',
      is_active: hero.is_active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      primary_button_text: 'Get Started',
      primary_button_link: '/signup',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="loading">Loading hero sections...</div>;
  }

  return (
    <div className="hero-section-manager">
      <h2>Hero Section Management</h2>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="form-container">
        <h3>{editingId ? 'Edit Hero Section' : 'Create New Hero Section'}</h3>
        <form onSubmit={editingId ? handleUpdate : handleCreate}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="World's First Video Marketplace"
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Connect with top video creators"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional description text..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Primary Button Text</label>
              <input
                type="text"
                value={formData.primary_button_text}
                onChange={(e) => setFormData({ ...formData, primary_button_text: e.target.value })}
                placeholder="Get Started"
              />
            </div>

            <div className="form-group">
              <label>Primary Button Link</label>
              <input
                type="text"
                value={formData.primary_button_link}
                onChange={(e) => setFormData({ ...formData, primary_button_link: e.target.value })}
                placeholder="/signup"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Secondary Button Text</label>
              <input
                type="text"
                value={formData.secondary_button_text}
                onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
                placeholder="Learn More"
              />
            </div>

            <div className="form-group">
              <label>Secondary Button Link</label>
              <input
                type="text"
                value={formData.secondary_button_link}
                onChange={(e) => setFormData({ ...formData, secondary_button_link: e.target.value })}
                placeholder="/about"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Hero Image URL</label>
            <input
              type="url"
              value={formData.hero_image}
              onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
              placeholder="https://cdn.example.com/hero.jpg"
            />
          </div>

          <div className="form-group">
            <label>Background Image URL</label>
            <input
              type="url"
              value={formData.background_image}
              onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
              placeholder="https://cdn.example.com/bg.jpg"
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active (visible on website)
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of Hero Sections */}
      <div className="hero-list">
        <h3>Existing Hero Sections ({heroSections.length})</h3>
        {heroSections.length === 0 ? (
          <p>No hero sections yet. Create one above!</p>
        ) : (
          <div className="items-grid">
            {heroSections.map((hero) => (
              <div key={hero.id} className={`hero-card ${!hero.is_active ? 'inactive' : ''}`}>
                {hero.hero_image && (
                  <img src={hero.hero_image} alt={hero.title} className="hero-preview" />
                )}
                <div className="hero-content">
                  <h4>{hero.title}</h4>
                  {hero.subtitle && <p className="subtitle">{hero.subtitle}</p>}
                  {hero.description && <p className="description">{hero.description}</p>}
                  
                  <div className="meta-info">
                    <span className={`status-badge ${hero.is_active ? 'active' : 'inactive'}`}>
                      {hero.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="created-date">
                      Created: {new Date(hero.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="actions">
                    <button onClick={() => handleEdit(hero)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(hero.id)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSectionManager;
```

---

#### Example 2: Trusted Companies with Drag-and-Drop

```tsx
// src/container/CMS/TrustedCompanies.tsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { cmsTrustedCompaniesAPI } from '../../services/cmsService';
import { TrustedCompany, CreateTrustedCompanyDTO } from '../../types/cms.types';

const TrustedCompaniesManager: React.FC = () => {
  const [companies, setCompanies] = useState<TrustedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await cmsTrustedCompaniesAPI.getAll();
      setCompanies(response.data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(companies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items. splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setCompanies(items);

    // Prepare reorder data
    const reorderData = {
      items: items.map((item, index) => ({
        id: item.id,
        sort_order: index,
      })),
    };

    // Send to backend
    try {
      await cmsTrustedCompaniesAPI.reorder(reorderData);
    } catch (error) {
      console.error('Failed to reorder:', error);
      // Revert on error
      await fetchCompanies();
    }
  };

  const handleCreate = async (data: CreateTrustedCompanyDTO) => {
    try {
      await cmsTrustedCompaniesAPI.create(data);
      await fetchCompanies();
      alert('Company added successfully!');
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this company?')) return;

    try {
      await cmsTrustedCompaniesAPI.delete(id);
      await fetchCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="trusted-companies-manager">
      <h2>Trusted Companies Management</h2>

      {/* Create Form Here */}
      
      {/* Drag-and-Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="companies">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="companies-list">
              {companies.map((company, index) => (
                <Draggable key={company.id} draggableId={String(company.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`company-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <span className="drag-handle">⋮⋮</span>
                      <img src={company.logo_url} alt={company.company_name} />
                      <span>{company.company_name}</span>
                      <button onClick={() => handleDelete(company.id)}>Delete</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TrustedCompaniesManager;
```

---

## 🗂 State Management

### Using React Query (Recommended)

```bash
npm install @tanstack/react-query
```

```tsx
// src/hooks/useCMSData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsHeroAPI } from '../services/cmsService';
import { CreateHeroDTO, UpdateHeroDTO } from '../types/cms.types';

// Fetch all hero sections
export const useHeroSections = () => {
  return useQuery({
    queryKey: ['hero-sections'],
    queryFn: async () => {
      const response = await cmsHeroAPI.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create hero section
export const useCreateHero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHeroDTO) => cmsHeroAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] });
    },
  });
};

// Update hero section
export const useUpdateHero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHeroDTO) => cmsHeroAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] });
    },
  });
};

// Delete hero section
export const useDeleteHero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cmsHeroAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] });
    },
  });
};
```

**Usage in Component:**

```tsx
import { useHeroSections, useCreateHero } from '../hooks/useCMSData';

const HeroManager = () => {
  const { data: heroSections, isLoading, error } = useHeroSections();
  const createMutation = useCreateHero();

  const handleCreate = (data: CreateHeroDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        alert('Created successfully!');
      },
      onError: (error) => {
        alert('Failed to create');
      },
    });
  };

  // Rest of component...
};
```

---

## ⚠️ Error Handling

### Comprehensive Error Handling Example

```tsx
const handleAPICall = async (apiFunction: () => Promise<any>) => {
  try {
    const response = await apiFunction();
    return { success: true, data: response };
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 400:
          // Validation error
          const errors = error.response.data?.errors || [];
          return { 
            success: false, 
            message: 'Validation failed', 
            errors 
          };
        
        case 401:
          // Unauthorized
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return { success: false, message: 'Please login again' };
        
        case 403:
          return { success: false, message: 'You do not have permission' };
        
        case 404:
          return { success: false, message: 'Resource not found' };
        
        case 429:
          return { success: false, message: 'Too many requests. Please try again later.' };
        
        default:
          return { success: false, message };
      }
    } else if (error.request) {
      // Request made but no response
      return { 
        success: false, 
        message: 'Server not responding. Please check your connection.' 
      };
    } else {
      // Something else went wrong
      return { 
        success: false, 
        message: error.message || 'An unexpected error occurred' 
      };
    }
  }
};

// Usage
const result = await handleAPICall(() => cmsHeroAPI.create(data));
if (result.success) {
  alert('Success!');
} else {
  alert(result.message);
}
```

---

## ✅ Best Practices

### 1. **Always Handle Loading States**

```tsx
{loading && <div className="spinner">Loading...</div>}
{error && <div className="error">{error}</div>}
{data && <div className="content">{/* Render data */}</div>}
```

### 2. **Validate Before Sending**

```tsx
const validateForm = (data: CreateHeroDTO): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }
  
  if (data.hero_image && !isValidURL(data.hero_image)) {
    errors.push('Hero image must be a valid URL');
  }
  
  return errors;
};
```

### 3. **Use Environment Variables**

```env
# .env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 4. **Implement Optimistic Updates**

```tsx
const handleToggleActive = async (id: number, currentState: boolean) => {
  // Update UI immediately
  setItems(items.map(item => 
    item.id === id ? { ...item, is_active: !currentState } : item
  ));

  // Then update backend
  try {
    await cmsHeroAPI.update({ id, is_active: !currentState });
  } catch (error) {
    // Revert on error
    setItems(items.map(item => 
      item.id === id ? { ...item, is_active: currentState } : item
    ));
  }
};
```

### 5. **Debounce Search/Filter**

```tsx
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch] = useDebounce(searchTerm, 500);

useEffect(() => {
  // Fetch with debounced search
  fetchItems(debouncedSearch);
}, [debouncedSearch]);
```

### 6. **Cache API Responses**

```tsx
// With React Query, caching is automatic!
const { data } = useQuery({
  queryKey: ['hero-sections'],
  queryFn: fetchHeroSections,
  staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
});
```

---

## 🎯 Complete Integration Checklist

- [ ] Install dependencies (`axios`, `@tanstack/react-query`)
- [ ] Create `api.ts` utility with axios instance
- [ ] Define TypeScript types in `cms.types.ts`
- [ ] Create API service in `cmsService.ts`
- [ ] Create React Query hooks (optional but recommended)
- [ ] Build admin panel components for each section:
  - [ ] Hero Section Manager
  - [ ] Trusted Companies Manager (with drag-and-drop)
  - [ ] Why Choose Us Manager
  - [ ] Featured Creators Manager
  - [ ] Success Stories Manager
  - [ ] Landing FAQs Manager
- [ ] Implement error handling and loading states
- [ ] Add form validation
- [ ] Test CRUD operations
- [ ] Test drag-and-drop reordering
- [ ] Test visibility toggle (active/inactive)
- [ ] Add confirmation dialogs for delete operations
- [ ] Implement image upload (if needed)
- [ ] Style components to match admin panel design

---

## 🔗 Additional Resources

- **Backend Documentation:** `CMS_BACKEND_FEATURE.md`
- **React Beautiful DnD:** https://github.com/atlassian/react-beautiful-dnd
- **React Query:** https://tanstack.com/query/latest
- **Axios:** https://axios-http.com/

---

## 📞 Support

For questions or issues:
1. Check API responses in browser DevTools Network tab
2. Review backend documentation
3. Check server logs: `npm run dev` in API directory
4. Contact backend team for API issues

---

**Status:** ✅ Ready for Integration  
**Last Updated:** December 24, 2025  
**Version:** 1.0.0

**Happy Coding! 🚀**
