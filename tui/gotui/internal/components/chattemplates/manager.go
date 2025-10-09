package chattemplates

import (
	"gotui/internal/styles"
)

// TemplateManager manages message templates
type TemplateManager struct {
	templates       map[string]MessageTemplate
	defaultTemplate MessageTemplate
}

// NewTemplateManager creates a new template manager with all built-in templates
func NewTemplateManager() *TemplateManager {
	tm := &TemplateManager{
		templates: make(map[string]MessageTemplate),
	}

	// Register built-in templates
	tm.RegisterTemplate(NewUserTemplate())
	tm.RegisterTemplate(NewAITemplate())
	tm.RegisterTemplate(NewSystemTemplate())
	tm.RegisterTemplate(NewErrorTemplate())

	// Register file operation templates
	tm.RegisterTemplate(NewReadFileTemplate())
	tm.RegisterTemplate(NewWriteFileTemplate())
	tm.RegisterTemplate(NewFileOperationTemplate())

	// Register tool execution template
	tm.RegisterTemplate(NewToolExecutionTemplate())

	// Set default template
	tm.defaultTemplate = NewDefaultTemplate()

	return tm
}

// RegisterTemplate registers a new message template
func (tm *TemplateManager) RegisterTemplate(template MessageTemplate) {
	tm.templates[template.GetMessageType()] = template
}

// RenderMessage renders a message using the appropriate template
func (tm *TemplateManager) RenderMessage(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	template, exists := tm.templates[data.Type]
	if !exists {
		template = tm.defaultTemplate
	}

	return template.Render(data, theme)
}

// GetTemplate returns a template for a specific message type
func (tm *TemplateManager) GetTemplate(messageType string) MessageTemplate {
	template, exists := tm.templates[messageType]
	if !exists {
		return tm.defaultTemplate
	}
	return template
}

// ListTemplates returns all registered template types
func (tm *TemplateManager) ListTemplates() []string {
	var types []string
	for msgType := range tm.templates {
		types = append(types, msgType)
	}
	return types
}
