# CampusFind – College Lost & Found Portal

A modern, SaaS-style frontend portal for managing lost and found belongings on a college campus. Built with pure **HTML5, CSS3, and Vanilla JavaScript** with complete local interactivity, role-based access, and `localStorage` persistence.

---

## 🚀 Key Features

### 1. Dual Main Options on Arrival
When you enter the portal, you are greeted with two prominent choice cards:
- 🔍 **"I Lost Something"**: Search found items or file a lost item report.
- 🎁 **"I Found Something"**: Check if someone reported it lost (and notify them), or submit a found report.

### 2. "I Found This Item!" Owner Notification System
- On the **Lost Items** page, if another student has the missing item, they can click **"I Found This!"** on the card or inside the detail modal.
- Opens the **"Notify Item Owner"** dialog:
  - Displays the owner's name and lost report details.
  - Finder enters where the item is kept (e.g. *Main Gate Security Cabin*, *Room 204*).
  - Finder writes a note for the owner.
  - Submitting changes the status to **"Found"** and sends a notification.
- **Notification Bell Dropdown**: The top navbar features a live notification bell with unread counters alerting users of found matches.
- **My Activity**: Dedicated tab for **"Notifications & Matches"** to review alerts and handovers.

### 3. Dual-Role Login System
- **Student Portal**: Instant 1-click login as **Rahul Sharma**. Admin tools are hidden.
- **Admin Portal**: Instant 1-click login as **Campus Security Admin** with claim review and management actions.

### 4. Real Photographs (Zero Placeholder Text)
- 16 real high-resolution photographs stored locally in `assets/images/` for AirPods, bracelets, watches, wallets, calculators, and more.
