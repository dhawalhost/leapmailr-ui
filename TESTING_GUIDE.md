# End-to-End Project Workflow Testing Guide

## ✅ Testing Checklist

### 1. **New User Registration & Default Project Creation**

**Steps:**
1. Navigate to `/register`
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `Test123!`
   - First Name: `Test`
   - Last Name: `User`
3. Click "Create Account"

**Expected Results:**
- ✅ User successfully registered
- ✅ Redirected to `/dashboard`
- ✅ A "Default Project" is automatically created
- ✅ Project switcher shows "Default Project" as selected
- ✅ Navigate to `/dashboard/projects` and verify "Default Project" exists with a "Default" badge

---

### 2. **Create Multiple Projects**

**Steps:**
1. Go to `/dashboard/projects`
2. Click "New Project" button
3. Create "Marketing Campaigns" project:
   - Name: `Marketing Campaigns`
   - Description: `Email campaigns for product launches`
   - Color: Blue (#3b82f6)
4. Click "Create Project"
5. Repeat for "Customer Support" project:
   - Name: `Customer Support`
   - Description: `Support and onboarding emails`
   - Color: Green (#10b981)

**Expected Results:**
- ✅ Projects created successfully
- ✅ Both projects appear in the projects list
- ✅ Projects show with correct colors and descriptions
- ✅ Creation date is today's date

---

### 3. **Switch Between Projects**

**Steps:**
1. Click the project switcher in the dashboard header
2. Select "Marketing Campaigns"
3. Verify the project switcher shows "Marketing Campaigns"
4. Navigate to different pages (Services, Templates, Analytics)
5. Switch to "Customer Support" project
6. Navigate through pages again

**Expected Results:**
- ✅ Project switcher updates when switching projects
- ✅ Selected project persists across page navigation
- ✅ Selected project persists after browser refresh
- ✅ Color indicator in switcher matches project color

---

### 4. **Create Email Services in Different Projects**

**Steps:**
1. Switch to "Marketing Campaigns" project
2. Go to `/dashboard/services`
3. Create a new email service:
   - Name: `Marketing SMTP`
   - Provider: SMTP
   - Configure SMTP settings
4. Switch to "Customer Support" project
5. Go to `/dashboard/services`
6. Create another email service:
   - Name: `Support SMTP`
   - Provider: SMTP

**Expected Results:**
- ✅ "Marketing SMTP" only visible when "Marketing Campaigns" is selected
- ✅ "Support SMTP" only visible when "Customer Support" is selected
- ✅ Services page shows "No services found" for "Default Project"
- ✅ Services are properly isolated per project

---

### 5. **Create Templates in Different Projects**

**Steps:**
1. Switch to "Marketing Campaigns" project
2. Go to `/dashboard/templates`
3. Create a new template:
   - Name: `Product Launch Email`
   - Subject: `New Product Available!`
   - Body: Marketing content
4. Switch to "Customer Support" project
5. Go to `/dashboard/templates`
6. Create another template:
   - Name: `Welcome Email`
   - Subject: `Welcome to Our Platform`
   - Body: Onboarding content

**Expected Results:**
- ✅ "Product Launch Email" only visible in "Marketing Campaigns" project
- ✅ "Welcome Email" only visible in "Customer Support" project
- ✅ Templates page shows "No templates found" for "Default Project"
- ✅ Templates are properly isolated per project

---

### 6. **Edit Project Details**

**Steps:**
1. Go to `/dashboard/projects`
2. Click the edit icon on "Marketing Campaigns"
3. Change name to `Marketing & Sales`
4. Change description to `All marketing and sales communications`
5. Change color to Purple
6. Click "Save Changes"

**Expected Results:**
- ✅ Project updates successfully
- ✅ New name appears in project list
- ✅ New color appears in project card and switcher
- ✅ Updated description visible in project card

---

### 7. **Set Default Project**

**Steps:**
1. Go to `/dashboard/projects`
2. Click the star icon on "Customer Support" project
3. Verify "Default" badge moves to "Customer Support"
4. Refresh the browser
5. Check project switcher

**Expected Results:**
- ✅ "Customer Support" becomes default project
- ✅ "Default" badge moves from old default to new default
- ✅ New default project is auto-selected on login/refresh
- ✅ Only one project has "Default" badge at a time

---

### 8. **Switch Project and Verify Isolation**

**Steps:**
1. Switch to "Marketing & Sales" project
2. Go to `/dashboard/services`
3. Note the services shown
4. Go to `/dashboard/templates`
5. Note the templates shown
6. Switch to "Customer Support" project
7. Check services and templates again

**Expected Results:**
- ✅ Different services visible for each project
- ✅ Different templates visible for each project
- ✅ No cross-contamination of resources
- ✅ Correct project name shown in all pages

---

### 9. **Delete Non-Default Project**

**Steps:**
1. Go to `/dashboard/projects`
2. Click trash icon on "Marketing & Sales" project
3. Confirm deletion in dialog
4. Try to delete "Customer Support" (current default)

**Expected Results:**
- ✅ "Marketing & Sales" deleted successfully
- ✅ Project removed from list
- ✅ Associated services and templates deleted (check backend)
- ✅ Cannot delete default project (delete button should be hidden or disabled)
- ✅ Warning shows about deleting associated resources

---

### 10. **Project Persistence After Logout/Login**

**Steps:**
1. Set "Customer Support" as current project
2. Logout from `/dashboard/settings` or user menu
3. Login again with same credentials
4. Check project switcher

**Expected Results:**
- ✅ Last selected project ("Customer Support") is auto-selected
- ✅ All projects still exist
- ✅ Services and templates still associated with correct projects

---

### 11. **Dashboard Stats & Analytics Per Project**

**Steps:**
1. Switch to "Customer Support" project
2. Go to `/dashboard` (main dashboard)
3. Check email statistics
4. Switch to another project
5. Check statistics again

**Expected Results:**
- ✅ Statistics should reflect emails sent using services from current project
- ✅ Recent emails filtered by current project
- ✅ Analytics page shows project-specific data

---

### 12. **Send Email Using Project-Scoped Service**

**Steps:**
1. Switch to "Customer Support" project
2. Go to `/dashboard/send`
3. Select email service (should only show services from current project)
4. Send a test email
5. Check email history

**Expected Results:**
- ✅ Only services from current project appear in dropdown
- ✅ Email sent successfully
- ✅ Email appears in history with correct project association

---

## 🐛 Known Issues to Check

1. **Project Switcher Hydration**: Verify no hydration errors in browser console
2. **Empty States**: Confirm "No projects/services/templates" messages display correctly
3. **Color Rendering**: All project colors render correctly throughout the UI
4. **Default Badge**: Only one project shows "Default" badge
5. **Delete Protection**: Cannot delete last project or default project
6. **API Errors**: Proper error messages for all failed operations

---

## 📊 Backend Database Verification

After testing, verify in PostgreSQL:

```sql
-- Check projects created
SELECT id, user_id, name, is_default, color FROM projects WHERE user_id = '<user_id>';

-- Check services linked to projects
SELECT id, name, project_id FROM email_services WHERE project_id IS NOT NULL;

-- Check templates linked to projects
SELECT id, name, project_id FROM templates WHERE project_id IS NOT NULL;

-- Verify only one default project per user
SELECT user_id, COUNT(*) as default_count 
FROM projects 
WHERE is_default = true 
GROUP BY user_id 
HAVING COUNT(*) > 1;
```

---

## ✅ Success Criteria

All tests pass if:
- [x] New users get default project automatically
- [x] Projects can be created, edited, and deleted
- [x] Project switching works correctly
- [x] Services are isolated per project
- [x] Templates are isolated per project
- [x] Default project can be changed
- [x] Cannot delete default or last project
- [x] Project selection persists across sessions
- [x] No UI errors or console warnings
- [x] All data properly associated in database

---

## 🚀 Next Steps After Testing

If all tests pass:
1. Deploy to production
2. Update user documentation
3. Consider adding:
   - Project sharing/collaboration
   - Project archiving
   - Project analytics dashboard
   - Bulk operations (move multiple resources)
