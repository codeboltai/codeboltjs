#!/bin/bash

echo "=== GOTUI TERMINAL DEBUG TEST ==="
echo "Terminal: $TERM"
echo "TTY: $(tty)"
echo "Columns: $COLUMNS"
echo "Lines: $LINES"
echo ""

echo "Testing terminal capabilities:"
echo "- Can set raw mode: $(stty -echo raw 2>/dev/null && echo "YES" || echo "NO")"
stty sane 2>/dev/null

echo ""
echo "Trying different TERM values:"

echo "1. Current TERM ($TERM):"
rm -f /tmp/gotui-debug.log
echo "Starting app..." && (./gotui -host localhost -port 3001 &)
sleep 3
pkill -f gotui 2>/dev/null
echo "Debug output:"
tail -5 /tmp/gotui-debug.log 2>/dev/null || echo "No debug output"
echo ""

echo "2. TERM=xterm-256color:"
rm -f /tmp/gotui-debug.log
TERM=xterm-256color echo "Starting app..." && (TERM=xterm-256color ./gotui -host localhost -port 3001 &)
sleep 3
pkill -f gotui 2>/dev/null
echo "Debug output:"
tail -5 /tmp/gotui-debug.log 2>/dev/null || echo "No debug output"
echo ""

echo "3. TERM=screen:"
rm -f /tmp/gotui-debug.log
TERM=screen echo "Starting app..." && (TERM=screen ./gotui -host localhost -port 3001 &)
sleep 3
pkill -f gotui 2>/dev/null
echo "Debug output:"
tail -5 /tmp/gotui-debug.log 2>/dev/null || echo "No debug output"
echo ""

echo "=== TEST COMPLETE ==="
