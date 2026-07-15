package v1

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestCustomizedProfileFaviconValidation(t *testing.T) {
	tests := []struct {
		name       string
		faviconURL string
		wantError  bool
	}{
		{name: "empty", faviconURL: ""},
		{name: "relative path", faviconURL: "/logo.webp"},
		{name: "https URL", faviconURL: "https://example.com/favicon.png"},
		{name: "PNG data URL", faviconURL: "data:image/png;base64,iVBORw0KGgo="},
		{name: "reject unsupported scheme", faviconURL: "javascript:alert(1)", wantError: true},
		{name: "reject oversized value", faviconURL: "data:image/png;base64," + strings.Repeat("a", 1<<20), wantError: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			value, err := json.Marshal(CustomizedProfile{Name: defaultServiceName, FaviconURL: test.faviconURL})
			if err != nil {
				t.Fatalf("failed to marshal customized profile: %v", err)
			}

			request := UpsertSystemSettingRequest{
				Name:  SystemSettingCustomizedProfileName,
				Value: string(value),
			}
			err = request.Validate()
			if test.wantError && err == nil {
				t.Fatal("expected validation error, got nil")
			}
			if !test.wantError && err != nil {
				t.Fatalf("expected no validation error, got %v", err)
			}
		})
	}
}
