# GPS Accuracy & Location Troubleshooting Guide

## Understanding Accuracy Readings

When you click "📍 Track Me", the app shows your GPS accuracy radius. Here's what each range means:

### Accuracy Levels:

| Accuracy | Quality | What It Means |
|----------|---------|---------------|
| **< 50m** | ✅ Excellent | Strong GPS + WiFi signal (best for directions) |
| **50-100m** | ✅ Good | Standard GPS signal (fine for navigation) |
| **100-500m** | ⚠️ Fair | Weak GPS signal (try going outside/opening window) |
| **> 500m** | ⚠️ Poor | Mostly IP-based location (not actual GPS) |

## How to Get Better GPS Accuracy

### 1. **Enable GPS on Your Device**
   - **Windows**: Settings → Privacy & Security → Location → Turn ON
   - **Android**: Settings → Location → Turn ON and select "High accuracy"
   - **iPhone**: Settings → Privacy → Location Services → Turn ON

### 2. **Go Outside**
   - GPS needs clear sky view. Being indoors significantly reduces accuracy
   - Even near windows can reduce signal strength

### 3. **Clear Line of Sight**
   - Avoid tall buildings blocking sky view
   - Trees and structures can weaken GPS signals
   - Open areas work best

### 4. **Use Location Permission Prompt**
   - When browser asks "Allow this app to access your location?" → Click **Allow**
   - This enables full GPS access, not just IP-based location

### 5. **Wait for GPS Lock**
   - First location acquisition takes 10-30 seconds
   - Accuracy improves as GPS locks onto more satellites
   - Keep the app open and stationary while it initializes

### 6. **Disable VPN or Proxy**
   - VPNs can reduce location accuracy
   - Temporarily disable if you're testing

## Verifying Your Location

The app now includes a **Location Debug Panel** (top-left corner) showing:

- **Coordinates**: Your exact GPS position (6 decimals = ~0.1m precision)
- **Accuracy Radius**: GPS error margin in meters
- **Distance from Campus**: How far you are from Babcock University center
- **GPS Quality**: Visual indicator of signal strength

### Expected Coordinates for Babcock Campus:
- **Campus Center**: 6.8905°N, 3.7200°E
- **Your location should be within ±3km** if on campus
- **Accuracy should be < 100m** if GPS is enabled

## Quick Location Check

1. Click **"📍 Track Me"** button
2. Check the **Location Debug Panel** (top-left)
3. If **"From Campus Center"** shows < 3km ✅ → You're likely getting real GPS
4. If > 10km or shows ⚠️ → Check GPS settings

## Testing Locations

Use the **🗺️ Google Maps** button in Location Debug Panel to:
- Open your exact location in Google Maps
- Compare with actual position on map
- Verify the blue location pin matches your real location

## Common Issues & Fixes

### Issue: Accuracy shows ±2000m or higher
**Solution**: Your device is using IP-based location, not GPS
- Enable GPS on your device
- Go outside for better signal
- Wait 30+ seconds for GPS to acquire satellites

### Issue: "Position unavailable" error
**Solution**: GPS is disabled or no signal
- Enable GPS in device settings
- Move to open area away from buildings
- Close and reopen the app

### Issue: Location permission denied
**Solution**: Browser doesn't have location access
- Check browser location settings
- Reset location permissions and try again
- Use incognito/private mode to test clean permissions

### Issue: Location jumps around wildly
**Solution**: Poor GPS signal (normal in cities)
- Accuracy ±500m means points within that circle
- Move to open area (parking lot, field)
- Wait for signal to stabilize (1-2 minutes)

## How the App Uses Your Location

1. **Blue Pin (📍)**: Your current GPS position
2. **Red Pin (🔴)**: Your navigation destination
3. **Arrow (↑)**: Direction from you to destination (rotates as you move)
4. **Accuracy Circle**: Shows GPS error margin around your location

The more accurate your GPS (< 100m), the better the directions and arrow rotation!

---

**Need Help?** Check browser console (F12) for detailed location data and error messages.
