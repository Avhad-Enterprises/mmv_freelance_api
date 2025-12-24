# CMS API Frontend Integration Guide

## ✅ CMS API Status: READY FOR INTEGRATION

The CMS API is now properly configured and accessible from the frontend without authentication.

---

## 📡 Available Public Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### 1️⃣ Get All Landing Page Content (Recommended)
```http
GET /cms-landing/public
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": [...],
    "trustedCompanies": [...],
    "whyChooseUs": [...],
    "featuredCreators": [...],
    "successStories": [...],
    "faqs": [...]
  },
  "message": "Active landing page content retrieved successfully"
}
```

### 2️⃣ Get Hero Section Only
```http
GET /cms-landing/public/hero
```

### 3️⃣ Get Trusted Companies
```http
GET /cms-landing/public/trusted-companies
```

### 4️⃣ Get Why Choose Us Items
```http
GET /cms-landing/public/why-choose-us
```

### 5️⃣ Get Featured Creators
```http
GET /cms-landing/public/featured-creators
```

### 6️⃣ Get Success Stories / Testimonials
```http
GET /cms-landing/public/success-stories
```

### 7️⃣ Get Landing Page FAQs
```http
GET /cms-landing/public/faqs
```

---

## 🚀 Frontend Integration Example

### React/Next.js Example

```typescript
// api/cms.ts
const CMS_BASE_URL = 'http://localhost:8000/api/v1/cms-landing';

export async function getLandingPageContent() {
  const response = await fetch(`${CMS_BASE_URL}/public`);
  const data = await response.json();
  return data.data;
}

export async function getHeroSection() {
  const response = await fetch(`${CMS_BASE_URL}/public/hero`);
  const data = await response.json();
  return data.data;
}

export async function getTrustedCompanies() {
  const response = await fetch(`${CMS_BASE_URL}/public/trusted-companies`);
  const data = await response.json();
  return data.data;
}

export async function getWhyChooseUs() {
  const response = await fetch(`${CMS_BASE_URL}/public/why-choose-us`);
  const data = await response.json();
  return data.data;
}

export async function getFeaturedCreators() {
  const response = await fetch(`${CMS_BASE_URL}/public/featured-creators`);
  const data = await response.json();
  return data.data;
}

export async function getSuccessStories() {
  const response = await fetch(`${CMS_BASE_URL}/public/success-stories`);
  const data = await response.json();
  return data.data;
}

export async function getLandingFaqs() {
  const response = await fetch(`${CMS_BASE_URL}/public/faqs`);
  const data = await response.json();
  return data.data;
}
```

### Usage in Component

```tsx
// pages/index.tsx
import { useEffect, useState } from 'react';
import { getLandingPageContent } from '@/api/cms';

export default function LandingPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getLandingPageContent();
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch CMS content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Hero Section */}
      {content.hero.map((hero) => (
        <section key={hero.cms_id}>
          <h1>{hero.title}</h1>
          <h2>{hero.subtitle}</h2>
          <p>{hero.description}</p>
          <img src={hero.hero_image} alt={hero.title} />
        </section>
      ))}

      {/* Trusted Companies */}
      <section>
        {content.trustedCompanies.map((company) => (
          <div key={company.cms_id}>
            <img src={company.logo_url} alt={company.company_name} />
          </div>
        ))}
      </section>

      {/* Why Choose Us */}
      <section>
        {content.whyChooseUs.map((item) => (
          <div key={item.cms_id}>
            <i className={item.icon}></i>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </section>

      {/* Featured Creators */}
      <section>
        {content.featuredCreators.map((creator) => (
          <div key={creator.cms_id}>
            <img src={creator.profile_image} alt={creator.name} />
            <h3>{creator.name}</h3>
            <p>{creator.bio}</p>
          </div>
        ))}
      </section>

      {/* Success Stories */}
      <section>
        {content.successStories.map((story) => (
          <div key={story.cms_id}>
            <img src={story.client_image} alt={story.client_name} />
            <p>{story.testimonial}</p>
            <strong>{story.client_name}</strong>
            <span>{story.client_title}</span>
          </div>
        ))}
      </section>

      {/* FAQs */}
      <section>
        {content.faqs.map((faq) => (
          <div key={faq.cms_id}>
            <h4>{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 🔧 Configuration Changes Made

### Updated Files:
1. **src/middlewares/auth.middleware.ts**
   - Added `/cms-landing/public` to public routes list
   - All CMS public endpoints now accessible without authentication

---

## ✅ Testing the API

### Using curl:
```bash
curl http://localhost:8000/api/v1/cms-landing/public
```

### Using PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/cms-landing/public" -Method GET
```

### Using Browser:
Simply open: `http://localhost:8000/api/v1/cms-landing/public`

---

## 📝 Response Format

All endpoints return:
```json
{
  "success": true,
  "data": [...],  // Array of CMS items or object with all sections
  "message": "Descriptive message"
}
```

---

## 🎯 Next Steps for Frontend

1. **Create API service** - Add the cms.ts file to your frontend
2. **Create TypeScript interfaces** - Define types for Hero, Company, etc.
3. **Fetch data** - Use useEffect or getServerSideProps
4. **Display content** - Map over arrays and render components
5. **Add loading states** - Handle loading and error states
6. **Cache responses** - Use React Query or SWR for caching

---

## 🚦 Server Status

To start the server:
```bash
cd "d:\Avhad Intern Project\MMV Freelancing\mmv_freelance_api"
npm run dev
```

Server will run on: `http://localhost:8000`

---

**Ready to integrate! 🎉**
