package messagesender

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"gotui/internal/stores"
	"gotui/internal/wsclient"
)

// Sender is responsible for encoding outbound user messages and delivering
// them to the websocket client.
type Sender struct {
	client *wsclient.Client
	agent  stores.AgentSelection
}

// New creates a new message sender bound to the given websocket client and
// default agent selection.
func New(client *wsclient.Client, agent stores.AgentSelection) *Sender {
	return &Sender{client: client, agent: agent}
}

// SetAgent updates the default agent selection used for outbound messages.
func (s *Sender) SetAgent(agent stores.AgentSelection) {
	s.agent = agent
}

// Send transmits the provided content to the server encoded as a user message.
func (s *Sender) Send(content string) error {
	if s == nil || s.client == nil {
		return errors.New("websocket client not configured")
	}
	if strings.TrimSpace(content) == "" {
		return errors.New("message content cannot be empty")
	}

	agent := s.agent
	if agent.ID == "" {
		agent.ID = uuid.NewString()
	}
	if agent.Name == "" {
		agent.Name = "Default Agent"
	}

	messageID := uuid.NewString()
	threadID := uuid.NewString()
	selectedAgent := map[string]any{
		"id":   agent.ID,
		"name": agent.Name,
	}
	if agent.AgentType != "" {
		selectedAgent["agentType"] = agent.AgentType
	}
	if agent.AgentDetails != "" {
		selectedAgent["agentDetails"] = agent.AgentDetails
	}

	payload := map[string]any{
		"message": map[string]any{
			"userMessage":        content,
			"selectedAgent":      selectedAgent,
			"mentionedFiles":     []string{},
			"mentionedFullPaths": []string{},
			"mentionedFolders":   []string{},
			"mentionedMCPs":      []string{},
			"uploadedImages":     []string{},
			"mentionedAgents":    []any{},
			"mentionedDocs":      []any{},
			"links":              []any{},
			"messageId":          messageID,
			"threadId":           threadID,
		},
		"sender": map[string]any{
			"senderType": "user",
			"senderInfo": map[string]any{"name": "user"},
		},
		"templateType": "user",
		"data": map[string]any{
			"text": content,
		},
		"messageId": messageID,
		"timestamp": fmt.Sprintf("%d", time.Now().UnixMilli()),
		"type":      "messageResponse",
	}

	return s.client.Send("messageResponse", payload)
}
