# 🧹 Livity Projects Inc. — Cleaning Services Website

> Full-featured business website for a professional cleaning company based in Guyana. Built with vanilla HTML, CSS and JavaScript — no frameworks, no dependencies.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![n8n](https://img.shields.io/badge/n8n_Webhook-EA4B71?style=flat-square&logo=n8n&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)

---

## 🌐 Live Demo

🔗 [olcide.github.io](https://hinojosa12.github.io/olcide.github.io/)

---

## 📸 Preview

| Home | Booking Form | Confirmation |
|------|-------------|--------------|
| Hero section with CTA | Calendar + service selector | Receipt + WhatsApp confirmation |

---

## ✨ Features

### 🗓️ Booking System
- Multi-step booking form with real-time validation
- Interactive calendar showing available dates per service category
- Dynamic service selector with 40+ services grouped by category
- Instant receipt generation after submission

### 📲 WhatsApp Integration
- Booking confirmation sent via WhatsApp to the customer
- Direct contact button floating on every page

### 🔗 n8n Webhook Automation
- Every booking submission fires a POST request to an n8n webhook
- Enables automated WhatsApp messages, Google Sheets logging, email notifications and more
- Zero backend server required — fully serverless architecture

### 📊 Built-in CRM
- All bookings saved in `localStorage`
- Sortable table with customer name, phone, service, date, address and status
- Clear history button with confirmation

### 🎨 UI/UX
- Fully responsive — mobile, tablet and desktop
- Scroll-triggered animations with IntersectionObserver API
- Animated stat counters
- Sticky navbar with scroll effect
- Service carousel with touch support
- Toast notification system

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Automation | n8n Webhook (no backend needed) |
| Storage | localStorage API |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts — Inter |
| Hosting | GitHub Pages |

---

## 📁 Project Structure

```
livity-projects/
├── index.html              # Main page (home, booking, CRM, about)
├── standardhomecleaning.html  # Services detail page
├── livity.jpeg             # Brand logo
├── Inicio.png              # Hero background
├── Section2.png            # About section background
├── primera.png             # Service card images
├── segunda.jpeg
├── tercera.png
├── residentialCleaning.jpeg
├── commercialCleaning.jpeg
├── cleaningSanitization.jpeg
├── carpetUpholstery.jpeg
└── pressureWashing.jpeg
```

---

## ⚙️ How the Booking Flow Works

```
User fills form
      │
      ▼
Client-side validation
      │
      ▼
Save to localStorage (CRM)
      │
      ▼
POST to n8n Webhook
      │
      ├──▶ Send WhatsApp confirmation to customer
      ├──▶ Log to Google Sheets
      └──▶ Notify business owner
```

---

## 🚀 Getting Started

No build tools or dependencies required.

```bash
# Clone the repository
git clone https://github.com/Hinojosa12/Ropa.git

# Open in browser
open index.html
```

To connect your own n8n webhook, update the `CONFIG` object in `index.html`:

```javascript
const CONFIG = {
  WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/your-id',
  SERVICES_PAGE: 'standardhomecleaning.html'
};
```

---

## 📦 Services Offered

| Category | Examples |
|----------|---------|
| Steam Cleaning | Sofas (1-3 seat), L-Shaped, Suites, Cars, Mattresses |
| Carpet Cleaning | Installed & uninstalled carpets |
| Pressure Washing | Driveways, patios, buildings, fences |
| Residential Cleaning | 1-3 bedroom homes, one-time refresh |
| Deep Cleaning | 1-4+ bedroom deep cleans |
| Commercial Cleaning | Offices, retail stores, warehouses |
| Move In/Out | 1-4+ bedroom properties |

---

## 👨‍💻 Built By

**Alcide Hinojosa** — Computer Engineer  
📧 alcidehinojosa@gmail.com  
🌍 Georgetown, Guyana  

---

## 📄 License

This project was built for **Livity Projects Inc.** All rights reserved.  
© 2026 Livity Projects Inc.
