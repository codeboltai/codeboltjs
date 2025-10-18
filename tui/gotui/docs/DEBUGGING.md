# 🐛 Black Screen Issue - Debug Guide

## 🎯 **Root Cause Identified**

The "flickering then black screen" issue was caused by **two main problems**:

1. **Terminal Raw Mode Issues**: Application failing to enter raw mode properly
2. **Window Size Never Set**: `WindowSizeMsg` was never being received, leaving dimensions at 0x0

## 🔧 **Solutions Applied**

### 1. **Terminal Mode Fixes**
```bash
# Run with proper terminal type
TERM=xterm-256color ./gotui -host localhost -port 3001

# OR set terminal type first
export TERM=xterm-256color
./gotui -host localhost -port 3001
```

### 2. **Code Fixes Applied**

#### **Robust Window Size Handling**
- Added fallback window size messages in `Init()`
- Force minimum dimensions (120x40) if WindowSizeMsg fails
- Multiple attempts to set window size

#### **Better Terminal Error Handling**
- Try with alt screen first, fallback to no alt screen
- Helpful error messages with suggested fixes
- Added comprehensive debugging

## 🚀 **How to Run Successfully**

### **Method 1: Set Terminal Type**
```bash
cd packages/gotui
go build ./cmd/gotui
TERM=xterm-256color ./gotui -host localhost -port 3001
```

### **Method 2: Export Terminal Type**
```bash
export TERM=xterm-256color
./gotui -host localhost -port 3001
```

### **Method 3: Default Run** (should now work)
```bash
./gotui  # TUI mode with local server
./gotui -host localhost -port 3001  # Client-only mode
```

## 🔍 **Debug Tools Added**

### **Debug Logging**
All activity is logged to `/tmp/gotui-debug.log`:
```bash
# View debug output
tail -f /tmp/gotui-debug.log

# View last 20 lines
tail -20 /tmp/gotui-debug.log
```

### **Debug Test Script**
```bash
# Run comprehensive terminal debugging
./test-debug.sh
```

## 📊 **What Was Happening**

1. **App starts** → UI components initialize
2. **Brief flicker** → Shows "🔄 Initializing..." 
3. **Goes black** → `width=0, height=0` never changes
4. **Connection works** → Backend functionality continues in background

## ✅ **Expected Behavior Now**

1. **Immediate UI** → Proper dimensions set immediately
2. **Full Interface** → Chat, sidebar panels, help bar all visible
3. **Responsive** → Adapts to terminal resizing
4. **Stable** → No more flickering or black screens

## 🛠️ **Troubleshooting**

### **If Still Getting Black Screen**
```bash
# Check terminal capabilities
echo "TERM: $TERM"
echo "TTY: $(tty)"

# Try different terminal types
TERM=screen ./gotui -host localhost -port 3001
TERM=xterm ./gotui -host localhost -port 3001
```

### **If Getting "Raw Mode" Errors**
```bash
# Reset terminal
reset

# Try in a fresh terminal session
# OR
# Run from a different terminal emulator
```

### **Debug Window Size Issues**
Check debug log for:
```
WindowSizeMsg received: 120x40
Window size set to: 120x40
```

If missing, the window size messages aren't getting through.

## 🎉 **The Fix is Complete!**

The application should now:
- ✅ Start without errors
- ✅ Display the full UI immediately  
- ✅ Handle terminal issues gracefully
- ✅ Provide helpful error messages
- ✅ Include comprehensive debugging
