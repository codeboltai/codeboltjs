package messagehandler

import (
	"encoding/json"
	"fmt"
	"strings"

	"gotui/internal/components/chat"
)

// Handler processes inbound websocket messages and routes them to the chat UI.
type Handler struct {
	chat    *chat.Chat
	logFunc func(string)
}

// New creates a handler bound to the provided chat component.
func New(chatComp *chat.Chat, log func(string)) *Handler {
	if log == nil {
		log = func(string) {}
	}
	return &Handler{chat: chatComp, logFunc: log}
}

// HandleRaw ingests the raw websocket payload and attempts to project it onto
// a chat message template.
func (h *Handler) HandleRaw(data []byte) {
	if h == nil || h.chat == nil || len(data) == 0 {
		return
	}

	var envelope map[string]any
	if err := json.Unmarshal(data, &envelope); err != nil {
		h.logFunc(fmt.Sprintf("messagehandler: failed to decode payload: %v", err))
		return
	}

	senderType := getNestedString(envelope, "sender", "senderType")
	templateType := stringValue(envelope["templateType"])
	messageType := stringValue(envelope["type"])

	content := firstNonEmpty(
		getNestedString(envelope, "data", "text"),
		getNestedString(envelope, "message", "userMessage"),
		getNestedString(envelope, "message", "assistantResponse"),
	)
	if content == "" {
		content = string(data)
	}

	chatType := resolveChatMessageType(senderType, templateType, messageType)
	h.chat.AddMessage(chatType, content)
}

func resolveChatMessageType(senderType, templateType, messageType string) string {
	senderType = strings.ToLower(senderType)
	templateType = strings.ToLower(templateType)
	messageType = strings.ToLower(messageType)

	switch senderType {
	case "user":
		return "user"
	case "system":
		return "system"
	}

	switch templateType {
	case "tool_execution", "tool-execution":
		return "tool_execution"
	case "file_operation", "file-operation":
		return "file_operation"
	case "read_file", "read-file":
		return "read_file"
	case "write_file", "write-file":
		return "write_file"
	case "error":
		return "error"
	}

	switch messageType {
	case "error":
		return "error"
	case "notification":
		return "system"
	case "tool_execution":
		return "tool_execution"
	}

	return "ai"
}

func getNestedString(m map[string]any, keys ...string) string {
	current := m
	for idx, key := range keys {
		if idx == len(keys)-1 {
			return stringValue(current[key])
		}
		child, ok := current[key].(map[string]any)
		if !ok {
			return ""
		}
		current = child
	}
	return ""
}

func stringValue(v any) string {
	switch value := v.(type) {
	case string:
		return value
	case fmt.Stringer:
		return value.String()
	case []byte:
		return string(value)
	case json.Number:
		return value.String()
	default:
		return ""
	}
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
