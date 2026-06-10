# 🎯 Own Today - White Label Client Engagement Platform

## Project Overview

**Own Today** is a white-label version of your DMHIOP client engagement application that enables treatment centers and healthcare organizations to deploy a fully customized client engagement platform with their own branding, providers, rewards system, and meeting configurations.

---

## 📂 Project Structure

```
own-today/
├── README-OWN-TODAY.md                      # This file - main documentation
├── OWN-TODAY-WHITE-LABEL-PROJECT-PLAN.md   # Detailed project plan & specifications
├── OWN-TODAY-DATABASE-SCHEMA.sql           # Complete database schema (Supabase)
│
├── css/
│   └── white-label.css                     # Themeable CSS with CSS variables
│
├── js/
│   ├── theming-engine.js                   # Dynamic theme application
│   ├── organization-context.js             # Multi-tenant logic (to be created)
│   └── supabase-client.js                  # Database configuration (to be created)
│
├── index.html                              # Landing page (to be created)
├── super-admin-dashboard.html              # Platform management (to be created)
├── organization-admin-portal.html          # Org admin interface (to be created)
├── client-portal.html                      # Client dashboard (to be created)
├── meeting-guide.html                      # Meeting finder (to be created)
├── rewards-store.html                      # Rewards catalog (to be created)
└── ... (additional pages to be created)
```

---

## 🚀 Quick Start Guide

### Prerequisites

1. **Supabase Account** - Free tier is sufficient for development
2. **Modern Browser** - Chrome, Firefox, Safari, or Edge (latest versions)
3. **Code Editor** - VS Code recommended
4. **Basic Knowledge** - HTML, CSS, JavaScript, SQL

### Step 1: Set Up Database

1. **Create a new Supabase project**
   - Go to https://supabase.com
   - Create account/sign in
   - Click "New Project"
   - Choose organization, name project "own-today-dev"
   - Set strong database password (save it!)
   - Select region closest to you

2. **Run the database schema**
   - Open Supabase project dashboard
   - Go to "SQL Editor" in left sidebar
   - Click "New Query"
   - Copy entire contents of `OWN-TODAY-DATABASE-SCHEMA.sql`
   - Paste into query editor
   - Click "Run" button
   - You should see "Success" message

3. **Verify tables created**
   - Go to "Table Editor"
   - You should see tables: `organizations`, `organization_providers`, `organization_clients`, `meeting_types`, `meetings`, etc.

4. **Get API credentials**
   - Go to "Settings" > "API"
   - Copy "Project URL" (e.g., `https://abcxyz.supabase.co`)
   - Copy "anon/public" key (starts with `eyJ...`)
   - Keep these safe - you'll need them next

### Step 2: Configure Theming Engine

1. Open `js/theming-engine.js`
2. Find lines 14-15:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://abcxyz.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJ...your-actual-key';
   ```

### Step 3: Create Your First Organization

Option A: **Using SQL (Quick)**
```sql
-- Run this in Supabase SQL Editor
INSERT INTO organizations (
    name, 
    subdomain, 
    slug, 
    contact_email, 
    primary_color,
    secondary_color,
    accent_color
) VALUES (
    'Mountain View Recovery',
    'mountainview',
    'mountain-view-recovery',
    'admin@mountainviewrecovery.com',
    '#2C5F7C',
    '#4A8BA8',
    '#F59E0B'
);

-- Seed default meeting types
SELECT seed_default_meeting_types(
    (SELECT id FROM organizations WHERE subdomain = 'mountainview')
);
```

Option B: **Wait for Super Admin Dashboard** (Phase 1)

### Step 4: Test Theming

1. Create a simple test HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Own Today Test</title>
    <link rel="stylesheet" href="css/white-label.css">
</head>
<body>
    <!-- Loading Indicator -->
    <div id="theme-loading-indicator">
        <div class="spinner"></div>
        <p>Loading theme...</p>
    </div>

    <!-- Test Content -->
    <nav class="navbar">
        <div class="navbar-brand">
            <img data-org-logo src="default-logo.png" alt="Logo" class="navbar-logo">
            <span data-org-name>Own Today</span>
        </div>
    </nav>

    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
        <h1>Welcome to <span data-org-name>Own Today</span></h1>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Theme Test</h2>
            </div>
            <p>If this card has your organization's colors, theming is working!</p>
            
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary">Primary Button</button>
                <button class="btn btn-secondary">Secondary Button</button>
                <button class="btn btn-accent">Accent Button</button>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h3>Organization Info:</h3>
            <p><strong>Email:</strong> <span data-org-email>Not loaded</span></p>
            <p><strong>Phone:</strong> <span data-org-phone>Not loaded</span></p>
        </div>
    </div>

    <!-- Load Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Load Theming Engine -->
    <script src="js/theming-engine.js"></script>
</body>
</html>
```

2. Save as `test-theme.html`
3. Open in browser with URL parameter: `test-theme.html?org=mountainview`
4. You should see your organization's colors and name applied!

---

## 🎨 How White-Label Theming Works

### 1. Dynamic Branding Elements

Use these data attributes in your HTML to make content dynamic:

```html
<!-- Logo -->
<img data-org-logo src="default-logo.png" alt="Logo">

<!-- Organization Name -->
<span data-org-name>Default Name</span>

<!-- Contact Info -->
<a data-org-email href="mailto:default@example.com">Contact</a>
<a data-org-phone href="tel:+1234567890">Call Us</a>
<span data-org-address>123 Main St</span>

<!-- Page Title -->
<h1 data-org-title data-base-title="Welcome">Welcome | Company</h1>
```

The `theming-engine.js` automatically finds these elements and replaces their content with organization-specific data.

### 2. CSS Variables

Your CSS should NEVER use hardcoded colors. Always use variables:

```css
/* ❌ WRONG - Hardcoded */
.button {
    background: #4A9FBF;
}

/* ✅ CORRECT - Variable */
.button {
    background: var(--org-primary);
}
```

Available CSS variables:
- `--org-primary` - Main brand color
- `--org-secondary` - Secondary color
- `--org-accent` - Accent/highlight color
- `--org-primary-light` - Lighter variant (auto-generated)
- `--org-primary-dark` - Darker variant (auto-generated)

### 3. Organization Detection

The system detects which organization a user is accessing via:

1. **Subdomain** (preferred): `mountainview.owntoday.app`
2. **URL Parameter**: `?org=mountainview`
3. **LocalStorage**: Previously selected organization

### 4. Feature Flags

Check if a feature is enabled for the current organization:

```javascript
// In your JavaScript
if (OwnTodayTheming.isFeatureEnabled('rewards')) {
    // Show rewards section
    document.getElementById('rewards-section').style.display = 'block';
}

if (OwnTodayTheming.isFeatureEnabled('timeclock')) {
    // Show time clock feature
    showTimeClockMenu();
}
```

---

## 📊 Database Architecture

### Key Tables

1. **organizations** - Each treatment center
2. **organization_providers** - Staff/admins for each org
3. **organization_clients** - Enrolled clients
4. **meeting_types** - Customizable meeting categories (AA, NA, therapy, etc.)
5. **meetings** - Specific meeting instances
6. **rewards_catalog** - Organization's reward offerings
7. **client_check_ins** - Meeting attendance records with geolocation
8. **rewards_redemptions** - Reward purchases by clients
9. **points_transactions** - Complete audit log of all points

### Data Isolation

Every table (except `organizations`) includes `organization_id` and Row Level Security (RLS) policies to ensure:
- Clients only see their organization's data
- Providers only manage their organization
- Organizations are completely isolated from each other

---

## 🛠️ Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ⏳
- [ ] Super admin dashboard
- [ ] Create organization form
- [ ] Logo upload system
- [ ] Organization switcher

### Phase 2: Organization Admin Portal (Weeks 3-4) ⏳
- [ ] Settings page (branding, contact info)
- [ ] Provider management
- [ ] Client management
- [ ] Real-time theme preview

### Phase 3: Meeting System (Week 5) ⏳
- [ ] Meeting types configuration
- [ ] Meetings management
- [ ] Client meeting guide
- [ ] Geofence check-ins

### Phase 4: Rewards System (Week 6) ⏳
- [ ] Rewards catalog management
- [ ] Redemption workflow
- [ ] Client rewards store
- [ ] Points system

### Phase 5: Client Sign-Up (Week 7) ⏳
- [ ] Public sign-up form
- [ ] Approval workflow
- [ ] Welcome emails
- [ ] Client authentication

### Phase 6: Polish & Launch (Week 8) ⏳
- [ ] Reviews system
- [ ] Analytics dashboard
- [ ] Documentation
- [ ] Production deployment

**Estimated Total Time**: 8-10 weeks

---

## 💡 Key Features

### For Organization Admins:
✅ Upload custom logo  
✅ Set brand colors (3 color pickers)  
✅ Add/manage providers  
✅ Customize meeting types  
✅ Add/edit all meetings  
✅ Create custom rewards  
✅ Approve client sign-ups  
✅ View engagement analytics  

### For Clients:
✅ Branded portal with org logo/colors  
✅ Find meetings by type/location  
✅ Check-in with geofencing  
✅ Earn points for activities  
✅ Redeem rewards  
✅ Track progress and streaks  
✅ Submit reviews  

### Technical:
✅ Multi-tenant architecture  
✅ Row-level security  
✅ Real-time theme updates  
✅ Mobile responsive  
✅ PWA capable  
✅ HIPAA-compliant ready  

---

## 🔐 Security Considerations

### Authentication Roles

- **super_admin** - You (platform owner)
- **org_admin** - Organization owner
- **org_provider** - Staff member
- **org_client** - End user

### Row Level Security

All tables have RLS enabled to ensure data isolation:
```sql
-- Example: Clients can only see their org's data
CREATE POLICY "Clients view own org"
ON meetings FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_clients
        WHERE user_id = auth.uid()
    )
);
```

### Best Practices

1. **Never expose super admin credentials**
2. **Use HTTPS only** (enforce in production)
3. **Validate all user input**
4. **Audit important actions** (use audit_log table)
5. **Regular security updates**

---

## 📖 Usage Examples

### Example 1: Creating a New Organization via Super Admin

```javascript
async function createOrganization(data) {
    const { data: org, error } = await supabase
        .from('organizations')
        .insert([{
            name: data.name,
            subdomain: data.subdomain.toLowerCase().replace(/\s+/g, '-'),
            slug: data.slug,
            contact_email: data.email,
            primary_color: data.primaryColor,
            secondary_color: data.secondaryColor,
            accent_color: data.accentColor
        }])
        .select()
        .single();
    
    if (error) {
        console.error('Error creating organization:', error);
        return null;
    }
    
    // Seed default meeting types
    await supabase.rpc('seed_default_meeting_types', {
        org_id: org.id
    });
    
    return org;
}
```

### Example 2: Client Checking Into a Meeting

```javascript
async function checkIntoMeeting(meetingId, latitude, longitude) {
    const org = OwnTodayTheming.getCurrentOrganization();
    
    // Calculate distance from meeting location
    const meeting = await getMeetingDetails(meetingId);
    const distance = calculateDistance(
        latitude, longitude,
        meeting.latitude, meeting.longitude
    );
    
    // Check if within geofence radius
    const withinRadius = distance <= meeting.check_in_radius_miles;
    
    // Create check-in record
    const { data, error } = await supabase
        .from('client_check_ins')
        .insert([{
            organization_id: org.id,
            client_id: currentClientId,
            meeting_id: meetingId,
            latitude: latitude,
            longitude: longitude,
            distance_from_meeting_miles: distance,
            location_verified: withinRadius,
            points_awarded: withinRadius ? meeting.points_per_check_in : 0
        }])
        .select()
        .single();
    
    if (!error && withinRadius) {
        // Award points
        await awardPoints(
            currentClientId,
            meeting.points_per_check_in,
            'check_in',
            data.id
        );
    }
    
    return { success: !error, withinRadius };
}
```

### Example 3: Customizing Meeting Types

```javascript
async function updateMeetingType(meetingTypeId, updates) {
    const { data, error } = await supabase
        .from('meeting_types')
        .update({
            name: updates.name,
            icon: updates.icon,
            color: updates.color,
            points_per_check_in: updates.pointsValue
        })
        .eq('id', meetingTypeId)
        .select()
        .single();
    
    return { data, error };
}
```

---

## 🎯 Deployment Timeframe for Buyers

Once this platform is fully built:

### Initial Setup (Done by You):
- **15-30 minutes** - Create organization in super admin dashboard
- **5 minutes** - Configure DNS/subdomain (if applicable)

### Organization Setup (Done by Buyer):
- **30-60 minutes** - Upload logo, set colors, enter contact info
- **1-2 hours** - Add providers and staff
- **2-4 hours** - Add meetings and create rewards catalog
- **Ongoing** - Approve clients, manage redemptions

**Total Time to Go Live**: 4-8 hours (same day deployment possible!)

---

## 📞 Support & Resources

### Documentation Files:
- `README-OWN-TODAY.md` - This file (getting started)
- `OWN-TODAY-WHITE-LABEL-PROJECT-PLAN.md` - Detailed specifications
- `OWN-TODAY-DATABASE-SCHEMA.sql` - Complete database structure

### External Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [PostgreSQL PostGIS](https://postgis.net/) - For geospatial queries

### Need Help?
- Check existing code comments
- Review project plan document
- Test with sample data first

---

## 🚀 Next Steps

1. ✅ **Review this README** - Make sure you understand the architecture
2. ✅ **Set up Supabase** - Create project and run schema
3. ✅ **Configure theming engine** - Add your API credentials
4. ✅ **Create test organization** - Use SQL or wait for admin dashboard
5. ✅ **Test theming** - Create test HTML file and verify colors/branding work
6. ⏳ **Begin Phase 1 development** - Super admin dashboard
7. ⏳ **Follow roadmap** - Work through phases systematically

---

## 📝 Notes

### Future Enhancements (Post-MVP):
- Mobile app (React Native)
- SMS notifications (Twilio integration)
- Video resources library
- Group messaging
- Appointment scheduling
- Integration with EHR systems
- Billing/subscription management

### Questions to Answer:
1. Central hosting vs. self-hosting?
2. Include time clock feature?
3. Pricing tiers with feature limits?
4. White-label mobile apps?

---

**Version**: 1.0  
**Created**: 2026-06-10  
**Status**: Planning/Foundation Phase  
**Target Launch**: 8-10 weeks from start
