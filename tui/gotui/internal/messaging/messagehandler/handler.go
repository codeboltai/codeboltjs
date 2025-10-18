package messagehandler

import (
	"encoding/json"
	"fmt"
	"strings"

	"gotui/internal/components/chat"
	"gotui/internal/components/chattemplates"
	"gotui/internal/logging"
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
	logging.Printf("messagehandler content: %s", content)
	chatType := resolveChatMessageType(senderType, templateType, messageType)

	metadata, buttons := extractMetadata(envelope)

	if len(metadata) > 0 || len(buttons) > 0 {
		h.chat.AddMessageWithMetadata(chatType, content, metadata, buttons)
	} else {
		h.chat.AddMessage(chatType, content)
	}
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

func extractMetadata(envelope map[string]any) (map[string]any, []chattemplates.MessageButton) {
	metadata := map[string]any{}

	if payload, ok := envelope["payload"].(map[string]any); ok {
		for k, v := range payload {
			metadata[k] = v
		}
	}

	if dataPayload, ok := envelope["data"].(map[string]any); ok {
		if payload, ok := dataPayload["payload"].(map[string]any); ok {
			for k, v := range payload {
				if _, exists := metadata[k]; !exists {
					metadata[k] = v
				}
			}
		}
	}

	for k, target := range map[string]string{
		"messageId": "message_id",
		"threadId":  "thread_id",
	} {
		if val := stringValue(envelope[k]); val != "" {
			metadata[target] = val
		}
	}

	if payloadType, ok := metadata["stateEvent"].(string); ok {
		metadata["state_event"] = payloadType
	}

	buttons := collectButtons(envelope, metadata)

	return metadata, buttons
}

func collectButtons(envelope map[string]any, metadata map[string]any) []chattemplates.MessageButton {
	if rawButtons, ok := envelope["buttons"]; ok {
		if buttons := parseButtons(rawButtons); len(buttons) > 0 {
			return buttons
		}
	}

	if rawButtons, ok := metadata["buttons"]; ok {
		if buttons := parseButtons(rawButtons); len(buttons) > 0 {
			return buttons
		}
	}

	return nil
}

func parseButtons(raw any) []chattemplates.MessageButton {
	arr, ok := raw.([]any)
	if !ok || len(arr) == 0 {
		return nil
	}

	buttons := make([]chattemplates.MessageButton, 0, len(arr))
	for _, entry := range arr {
		btnMap, ok := entry.(map[string]any)
		if !ok {
			continue
		}

		button := chattemplates.MessageButton{}
		button.ID = fallbackString(btnMap["id"], btnMap["value"], btnMap["text"])
		button.Label = fallbackString(btnMap["label"], btnMap["text"], btnMap["value"])
		button.Description = fallbackString(btnMap["description"], btnMap["buttonClickedText"])

		if button.Label == "" {
			continue
		}
		if button.ID == "" {
			button.ID = button.Label
		}

		buttons = append(buttons, button)
	}

	if len(buttons) == 0 {
		return nil
	}
	return buttons
}

func fallbackString(values ...any) string {
	for _, v := range values {
		if s := stringValue(v); s != "" {
			return s
		}
	}
	return ""
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
