package versionchecker

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetLatestVersion(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		require.NoError(t, json.NewEncoder(w).Encode("0.22.0"))
	}))
	defer server.Close()

	checker := NewVersionChecker(nil, nil)
	checker.httpClient = server.Client()
	checker.versionURL = server.URL

	latestVersion, err := checker.GetLatestVersion()
	require.NoError(t, err)
	require.Equal(t, "0.22.0", latestVersion)
}
