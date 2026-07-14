package sqlite

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/usememos/memos/server/profile"
	"github.com/usememos/memos/store"
)

func TestDeleteMemoWithConcurrentReaderKeepsLogicalCleanup(t *testing.T) {
	ctx := context.Background()
	dsn := filepath.Join(t.TempDir(), "memos_test.db")
	driver, err := NewDB(&profile.Profile{DSN: dsn})
	require.NoError(t, err)
	db := driver.(*DB)
	t.Cleanup(func() { require.NoError(t, db.Close()) })

	_, err = db.db.ExecContext(ctx, `
		CREATE TABLE user (id INTEGER PRIMARY KEY);
		CREATE TABLE memo (id INTEGER PRIMARY KEY, creator_id INTEGER NOT NULL);
		CREATE TABLE resource (id INTEGER PRIMARY KEY, creator_id INTEGER NOT NULL);
		CREATE TABLE user_setting (user_id INTEGER NOT NULL);
		CREATE TABLE memo_organizer (memo_id INTEGER NOT NULL, user_id INTEGER NOT NULL);
		CREATE TABLE memo_relation (memo_id INTEGER NOT NULL, related_memo_id INTEGER NOT NULL);
		CREATE TABLE inbox (sender_id INTEGER NOT NULL);
		CREATE TABLE tag (creator_id INTEGER NOT NULL);
		INSERT INTO user (id) VALUES (1);
		INSERT INTO memo (id, creator_id) VALUES (1, 1);
		INSERT INTO memo_organizer (memo_id, user_id) VALUES (1, 1);
	`)
	require.NoError(t, err)

	// Keep a read cursor open to reproduce the normal web UI's concurrent
	// reads. SQLite VACUUM cannot run in this state, but logical cleanup can.
	rows, err := db.db.QueryContext(ctx, "SELECT id FROM memo")
	require.NoError(t, err)
	require.True(t, rows.Next())

	require.NoError(t, db.DeleteMemo(ctx, &store.DeleteMemo{ID: 1}))
	require.NoError(t, rows.Close())

	var memoCount int
	require.NoError(t, db.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM memo").Scan(&memoCount))
	require.Zero(t, memoCount)

	var organizerCount int
	require.NoError(t, db.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM memo_organizer").Scan(&organizerCount))
	require.Zero(t, organizerCount)
}
