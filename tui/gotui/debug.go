package main

import (
	"fmt"
	"log"
	"os"
	"time"
)

var debugFile *os.File

func initDebug() {
	var err error
	debugFile, err = os.OpenFile("/tmp/gotui-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("Failed to open debug file: %v", err)
		return
	}
}

func debugLog(format string, args ...interface{}) {
	if debugFile == nil {
		return
	}
	timestamp := time.Now().Format("15:04:05.000")
	message := fmt.Sprintf("[%s] %s\n", timestamp, fmt.Sprintf(format, args...))
	debugFile.WriteString(message)
	debugFile.Sync()
}

func closeDebug() {
	if debugFile != nil {
		debugFile.Close()
	}
}
