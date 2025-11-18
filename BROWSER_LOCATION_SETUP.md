# Browser Location Permission Setup Guide

## The Permission Prompt

When you click **"📍 Track Me"**, your browser will display a permission prompt asking:
**"Allow this site to access your location?"**

You **MUST click "Allow"** for the app to access your GPS location.

---

## Browser-Specific Instructions

### Chrome / Edge / Brave

#### When You See the Prompt:
1. A popup appears at the top of the address bar asking for location permission
2. Click **"Allow"** to grant permission
3. Location tracking will activate

#### If You Accidentally Clicked "Block":
1. Click the **location icon** (or **lock icon**) in the address bar on the right
2. Find "Location" in the permissions list
3. Change it from "Blocked" to **"Allow"**
4. Refresh the page and try "📍 Track Me" again

#### Manual Permission Settings:
1. Open **Settings** → **Privacy and security** → **Site settings**
2. Click on **Location**
3. Find this website in the list
4. Change from "Block" to **"Allow"**

---

### Firefox

#### When You See the Prompt:
1. A permission bar appears below the address bar
2. Click **"Allow"** (green button)
3. Location tracking will activate

#### If You Need to Reset:
1. Click the **lock icon** in the address bar (left side)
2. Click **"Clear Site Data"** or **manage permissions**
3. Refresh and try again

#### Manual Permission Settings:
1. Open **Preferences** → **Privacy & Security**
2. Scroll down to **Permissions** → **Location**
3. Click **Settings** button
4. Find this website and **allow** it

---

### Safari (Mac/iOS)

#### When You See the Prompt:
1. A dialog box appears asking "Allow 'site' to access your location?"
2. Click **"Allow"**
3. Location tracking will activate

#### To Reset Permissions:
1. Safari menu → **Settings...**
2. Go to **Privacy** tab
3. Under **Location**, find this website
4. Click **Allow**

---

### Mobile Browsers (Android)

#### Chrome on Android:
1. When prompted, tap **"Allow"**
2. Make sure device location is enabled: Settings → Location → ON

#### Firefox on Android:
1. When prompted, tap **"Allow"**
2. Device location must be: Settings → Location → ON

---

## Troubleshooting

### "Position Unavailable" Error
**The browser asked for permission, but location can't be found**

Fix:
- Ensure GPS is **enabled** on your device (Settings → Location → ON)
- Go **outside** for better GPS signal
- Wait 20-30 seconds for GPS to acquire satellites

### "Permission Denied" Error
**You clicked "Block" or the browser has it set to blocked**

Fix:
1. Click the **lock/location icon** in your address bar
2. Find "Location" permission
3. Change it to **"Allow"**
4. Click "📍 Track Me" again

### "Timeout" Error
**Location is taking too long to respond**

Fix:
- Make sure GPS is enabled on device
- Go to open area (away from buildings)
- Make sure other location apps aren't using GPS
- Try again

---

## Checking Your Settings

### Verify Permission is Allowed:

**Chrome/Edge:**
- Address bar → Click lock icon → "Location" should say "Allowed"

**Firefox:**
- Address bar → Click lock icon → "Location" should say "Allowed"

**Safari:**
- Safari menu → Preferences → Privacy → Location should show domain as "Allowed"

---

## Why Permission is Needed

The browser asks for location permission because:
- ✅ **Security**: Apps shouldn't access location without your permission
- ✅ **Privacy**: You control what apps know about your location
- ✅ **Safety**: Blocking malicious apps from tracking you

This campus navigator app **only uses your location** to:
1. Show your current position on the map
2. Calculate routes to buildings
3. Display navigation arrows while you navigate

Your location data **stays on your device** and is **not sent to any server**.

---

## Quick Test

1. Click **"📍 Track Me"**
2. Look for browser permission prompt
3. Click **"Allow"**
4. Look at **Location Debug Panel** (top-left) for your coordinates
5. Click **"🗺️ Google Maps"** to verify location is correct

If the blue pin appears on the map at your location = ✅ Working!

---

## Still Having Issues?

Check these in order:
1. ✅ Did you click **"Allow"** on the permission prompt?
2. ✅ Is GPS **enabled** on your device? (Settings → Location → ON)
3. ✅ Are you **outside** or near a window? (GPS needs clear sky)
4. ✅ Do other location apps work? (Google Maps, Weather, etc.)

If still stuck, open browser **Developer Console (F12)** and look for error messages about location.
