package chat

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"gotui/internal/components/chattemplates"
	"gotui/internal/components/uicomponents/diffview"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// Conversation represents a single chat history thread.
type Conversation struct {
	ID        string
	Title     string
	Messages  []chattemplates.MessageTemplateData
	CreatedAt time.Time
	UpdatedAt time.Time
}

// conversationRegion tracks screen coordinates for hover & click handling.
type conversationRegion struct {
	conversationID string
	yStart         int
	yEnd           int
}

// verticalRegion tracks a clickable area by vertical bounds.
type verticalRegion struct {
	yStart int
	yEnd   int
}

func (c *Chat) createInitialConversation() {
	if len(c.conversations) > 0 {
		return
	}

	conv := c.newConversation("Conversation 1")
	conv.Messages = append(conv.Messages, c.newMessageData("system", "🚀 Welcome to Codebolt! Type 'help' to see available commands.", nil))

	sampleReadContent := strings.Join([]string{
		"// Preview of the read file template",
		"package demo",
		"",
		"func Hello() string {",
		"\treturn \"Hello from the read file template!\"",
		"}",
	}, "\n")
	conv.Messages = append(conv.Messages, c.newMessageData("read_file", sampleReadContent, map[string]interface{}{"file_path": "demo/hello.go"}))

	if unifiedPreview, splitPreview := sampleDiffPreviews(); unifiedPreview != "" || splitPreview != "" {
		if unifiedPreview != "" {
			conv.Messages = append(conv.Messages, c.newMessageData("system", unifiedPreview, nil))
		}
		if splitPreview != "" {
			conv.Messages = append(conv.Messages, c.newMessageData("system", splitPreview, nil))
		}
	}

	c.conversations = []*Conversation{conv}
	c.activeConversationID = conv.ID
}

func sampleDiffPreviews() (string, string) {
	theme := styles.CurrentTheme()
	lines := sampleDiffLines()
	unified := diffview.RenderUnified(lines, 72, diffview.UnifiedOptions{ShowLineNumbers: true}, theme)
	split := diffview.RenderSplit(lines, 72, diffview.SplitOptions{ShowHeaders: true, ShowLineNumbers: true, Divider: "│"}, theme)

	unifiedLines := append([]string{"🧪 Unified diff preview:"}, unified.Lines...)
	splitLines := append([]string{"🧪 Split diff preview:"}, split.Lines...)

	return strings.Join(unifiedLines, "\n"), strings.Join(splitLines, "\n")
}

func sampleDiffLines() []diffview.DiffLine {
	return []diffview.DiffLine{
		{Kind: diffview.DiffLineHeader, Header: "@@ -14,5 +14,8 @@"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "14", NewLine: "14", OldText: "func greet(name string) error {", NewText: "func greet(name string) error {"},
		{Kind: diffview.DiffLineRemoved, OldLine: "15", OldText: "\treturn errors.New(\"missing name\")"},
		{Kind: diffview.DiffLineAdded, NewLine: "15", NewText: "\tif name == \"\" {"},
		{Kind: diffview.DiffLineAdded, NewLine: "16", NewText: "\t\treturn errors.New(\"missing name\")"},
		{Kind: diffview.DiffLineAdded, NewLine: "17", NewText: "\t}"},
		{Kind: diffview.DiffLineAdded, NewLine: "18", NewText: "\tfmt.Printf(\"Hello, %s!\\n\", name)"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "19", NewLine: "19", OldText: "\treturn nil", NewText: "\treturn nil"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "20", NewLine: "20", OldText: "}", NewText: "}"},
	}
}

func (c *Chat) newConversation(title string) *Conversation {
	c.conversationCounter++
	now := time.Now()
	return &Conversation{
		ID:        fmt.Sprintf("conversation-%d", c.conversationCounter),
		Title:     title,
		Messages:  make([]chattemplates.MessageTemplateData, 0, 16),
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (c *Chat) createNewConversation() tea.Cmd {
	title := fmt.Sprintf("Conversation %d", c.conversationCounter+1)
	conv := c.newConversation(title)
	conv.Messages = append(conv.Messages, c.newMessageData("system", "✨ Started a new conversation. Ask a question or type 'help' to see available commands.", nil))

	c.conversations = append(c.conversations, conv)
	c.activeConversationID = conv.ID
	c.resortConversations()
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conv.ID

	return c.Focus()
}

func (c *Chat) loadActiveConversation() {
	c.refreshActiveConversationView()
}

func (c *Chat) refreshActiveConversationView() {
	conv := c.getActiveConversation()
	if conv == nil {
		c.viewport.Clear()
		return
	}

	messages := c.cloneMessagesWithWidth(conv.Messages)
	c.viewport.SetMessages(messages)
}

func (c *Chat) appendMessageToActiveConversation(msgType, content string, metadata map[string]interface{}) {
	conv := c.getActiveConversation()
	if conv == nil {
		c.createNewConversation()
		conv = c.getActiveConversation()
	}
	if conv == nil {
		return
	}

	conv.Messages = append(conv.Messages, c.newMessageData(msgType, content, metadata))
	conv.UpdatedAt = time.Now()
	c.resortConversations()
	c.refreshActiveConversationView()
	c.ensureHoverSelection()
}

func (c *Chat) switchConversation(conversationID string) {
	if conversationID == "" || conversationID == c.activeConversationID {
		return
	}
	if c.getConversationByID(conversationID) == nil {
		return
	}

	c.activeConversationID = conversationID
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conversationID
	c.syncConversationPanelHover(conversationID)
}

func (c *Chat) getActiveConversation() *Conversation {
	return c.getConversationByID(c.activeConversationID)
}

func (c *Chat) getConversationByID(id string) *Conversation {
	for _, conv := range c.conversations {
		if conv.ID == id {
			return conv
		}
	}
	return nil
}

func (c *Chat) resortConversations() {
	sort.SliceStable(c.conversations, func(i, j int) bool {
		if c.conversations[i].UpdatedAt.Equal(c.conversations[j].UpdatedAt) {
			return c.conversations[i].CreatedAt.After(c.conversations[j].CreatedAt)
		}
		return c.conversations[i].UpdatedAt.After(c.conversations[j].UpdatedAt)
	})
	c.syncConversationPanelItems()
}

func (c *Chat) newMessageData(msgType, content string, metadata map[string]interface{}) chattemplates.MessageTemplateData {
	width := c.messageWidth()
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	return chattemplates.MessageTemplateData{
		Type:      msgType,
		Content:   content,
		Timestamp: time.Now(),
		Raw:       false,
		Width:     width,
		Metadata:  metadata,
	}
}

func (c *Chat) cloneMessagesWithWidth(messages []chattemplates.MessageTemplateData) []chattemplates.MessageTemplateData {
	if len(messages) == 0 {
		return nil
	}
	width := c.messageWidth()
	cloned := make([]chattemplates.MessageTemplateData, len(messages))
	for i, msg := range messages {
		msg.Width = width
		cloned[i] = msg
	}
	return cloned
}

func (c *Chat) messageWidth() int {
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return c.viewportWidth()
}

func (c *Chat) viewportWidth() int {
	width := c.viewport.Width()
	if width > 0 {
		return width
	}
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return 80
}
