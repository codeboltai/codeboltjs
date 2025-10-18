package logging

import (
	"io"
	"log"
	"os"
	"path/filepath"
	"sync"
)

const defaultFlags = log.Ldate | log.Ltime | log.Lmicroseconds

var (
	initOnce sync.Once
	logger   *log.Logger
	logFile  *os.File
	mu       sync.RWMutex
)

func ensureLogger() {
	initOnce.Do(func() {
		logger = log.New(os.Stdout, "", defaultFlags)
	})
}

// ConfigureFile configures the shared logger to write to the given path.
// When truncate is true, the file will be overwritten on each run; otherwise logs are appended.
func ConfigureFile(path string, truncate bool) error {
	ensureLogger()
	flags := os.O_CREATE | os.O_WRONLY
	if truncate {
		flags |= os.O_TRUNC
	} else {
		flags |= os.O_APPEND
	}

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}

	file, err := os.OpenFile(path, flags, 0o644)
	if err != nil {
		return err
	}

	mu.Lock()
	if logFile != nil {
		_ = logFile.Close()
	}
	logger.SetOutput(file)
	logFile = file
	mu.Unlock()

	return nil
}

// SetOutput allows callers to redirect log output to the supplied writer.
func SetOutput(w io.Writer) {
	ensureLogger()
	mu.Lock()
	if logFile != nil {
		_ = logFile.Close()
		logFile = nil
	}
	logger.SetOutput(w)
	mu.Unlock()
}

// Close releases the current log file, if any.
func Close() error {
	ensureLogger()
	mu.Lock()
	defer mu.Unlock()
	if logFile != nil {
		err := logFile.Close()
		logFile = nil
		logger.SetOutput(os.Stdout)
		return err
	}
	return nil
}

// Logger returns the shared *log.Logger instance.
func Logger() *log.Logger {
	ensureLogger()
	return logger
}

// Printf writes a formatted log entry using the shared logger.
func Printf(format string, args ...any) {
	Logger().Printf(format, args...)
}

// Println writes a log entry using the shared logger.
func Println(args ...any) {
	Logger().Println(args...)
}

// Fatalf writes a formatted log entry and exits.
func Fatalf(format string, args ...any) {
	Logger().Fatalf(format, args...)
}

// Fatal writes a log entry and exits.
func Fatal(args ...any) {
	Logger().Fatal(args...)
}
