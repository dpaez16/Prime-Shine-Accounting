package assert

import "testing"

func Equal[T comparable](t *testing.T, actual T, expected T) {
	t.Helper()

	if actual != expected {
		t.Errorf("got: %v, expected: %v", actual, expected)
	}
}
